import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { z } from "zod";
import { ArrowLeft } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { useExamStore } from "@/stores/examStore";
import { useShallow } from "zustand/react/shallow";
import {
  useSubmitResponse,
  useSubmitResponsesBulk,
  usePauseExam,
  useResumeExam,
  useToggleBookmark,
  useReportQuestion,
  useCompleteExam,
  useBookmarks,
} from "@/feature/exams/hooks/useExams";
import {
  QuestionCard,
  QuestionNavigator,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  EssayQuestion,
  RichContentRenderer,
  Explanation,
} from "@/components/questions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Question } from "@/api/types/exam.types";

const examParamsSchema = z.object({
  attemptId: z.string(),
});

// Answer types for different question types
type AnswerValue =
  | string // SINGLE_CHOICE
  | string[] // MULTIPLE_CHOICE
  | boolean // TRUE_FALSE
  | Record<string, string> // FILL_IN_BLANK
  | null;

function ExamPage() {
  const { attemptId } = Route.useParams();
  const navigate = useNavigate();

  // Use useShallow for object selectors to prevent unnecessary re-renders
  // This does shallow equality check on the returned object
  const {
    timeRemaining,
    timerRunning,
    currentAttempt,
    questions,
    currentQuestionIndex,
    answers,
  } = useExamStore(
    useShallow((state) => ({
      timeRemaining: state.timeRemaining,
      timerRunning: state.timerRunning,
      currentAttempt: state.currentAttempt,
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
    }))
  );

  // Select responses Map size separately to avoid re-renders on every Map change
  // We only need the keys for checking submission status
  const responsesKeys = useExamStore(
    useShallow((state) => Array.from(state.responses.keys()))
  );

  // Validate that stored attemptId matches URL
  const isValidSession = currentAttempt?.id === attemptId;

  // State for loading exam from API
  const [isLoadingExam, setIsLoadingExam] = useState(!isValidSession);
  const [loadError, setLoadError] = useState<string>("");

  // Actions from store - select all at once using useShallow
  // Actions are stable functions so this won't cause re-renders
  const {
    setCurrentQuestion,
    nextQuestion,
    previousQuestion,
    updateTimeRemaining,
    setAnswer,
  } = useExamStore(
    useShallow((state) => ({
      setCurrentQuestion: state.setCurrentQuestion,
      nextQuestion: state.nextQuestion,
      previousQuestion: state.previousQuestion,
      updateTimeRemaining: state.updateTimeRemaining,
      setAnswer: state.setAnswer,
    }))
  );

  // API mutations
  const submitResponse = useSubmitResponse();
  const submitResponsesBulk = useSubmitResponsesBulk();
  const pauseExam = usePauseExam();
  const resumeExam = useResumeExam();
  const toggleBookmark = useToggleBookmark();
  const reportQuestion = useReportQuestion();
  const completeExam = useCompleteExam();

  // Derive submittedQuestions from responses keys array
  const submittedQuestions = useMemo(() => {
    return new Set(responsesKeys);
  }, [responsesKeys]);

  // Check if store has valid exam data for this attemptId
  useEffect(() => {
    if (isValidSession) {
      setIsLoadingExam(false);
    } else {
      // Store doesn't have data for this attempt - redirect back
      setLoadError("Exam session not found. Please resume from the tests page.");
      setIsLoadingExam(false);
    }
  }, [attemptId, isValidSession]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const { data: serverBookmarks } = useBookmarks();

  // Hydrate bookmarked questions from server on mount/resume
  useEffect(() => {
    if (serverBookmarks && questions.length > 0) {
      // API may return array or paginated { items: [...] }
      const bookmarks = Array.isArray(serverBookmarks)
        ? serverBookmarks
        : (serverBookmarks as any)?.items ?? [];
      const questionIds = new Set(questions.map((q) => q.id));
      const bookmarked = new Set<string>(
        bookmarks
          .filter((b: any) => questionIds.has(b.questionId))
          .map((b: any) => b.questionId)
      );
      if (bookmarked.size > 0) {
        setBookmarkedQuestions(bookmarked);
      }
    }
  }, [serverBookmarks, questions]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Track time spent on each question
  const questionStartTime = useRef<number>(0);

  // Initialize the question start time on mount
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, []);

  // Current question
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Check if this is a practice exam
  const isPracticeExam = currentAttempt?.exam?.examTypeEnum === "PRACTICE";

  // Answered questions tracking
  const answeredQuestions = useMemo(() => {
    const answered = new Set<number>();
    questions.forEach((q, index) => {
      const answer = answers[q.id];
      if (answer !== null && answer !== undefined) {
        if (Array.isArray(answer) && answer.length > 0) {
          answered.add(index);
        } else if (typeof answer === "string" && answer.length > 0) {
          answered.add(index);
        } else if (typeof answer === "boolean") {
          answered.add(index);
        } else if (typeof answer === "object" && Object.keys(answer).length > 0) {
          answered.add(index);
        }
      }
    });
    return answered;
  }, [answers, questions]);

  // Reset question timer when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestionIndex]);

  // Timer effect - using functional update pattern to avoid recreating interval every second
  // timeRemaining is intentionally excluded - we read it only for the guard condition,
  // and use functional updates inside the interval to avoid stale closures
  useEffect(() => {
    if (!timerRunning || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      updateTimeRemaining((prev: number | null) => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, updateTimeRemaining]);

  // Handle answer change - save to persisted store
  const handleAnswerChange = useCallback((questionId: string, value: AnswerValue) => {
    setAnswer(questionId, value);
  }, [setAnswer]);

  // Handle submit for current question
  const handleSubmitAnswer = useCallback(() => {
    if (!currentAttempt || !currentQuestion) return;

    const questionId = currentQuestion.id;
    const value = answers[questionId];

    if (value === null || value === undefined) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);

    // Format answer based on type
    let formattedAnswer: string | string[] | boolean = "";
    if (typeof value === "boolean") {
      formattedAnswer = value;
    } else if (Array.isArray(value)) {
      formattedAnswer = value;
    } else if (typeof value === "object") {
      // Fill in blank - convert to string representation
      formattedAnswer = JSON.stringify(value);
    } else {
      formattedAnswer = value;
    }

    submitResponse.mutate(
      {
        attemptId: currentAttempt.id,
        request: {
          questionId,
          answer: formattedAnswer,
          timeSpentSeconds: timeSpent,
        },
      },
      {
        onSuccess: () => {
          // Response is automatically added to store by the hook
          setErrorMessage(""); // Clear any previous errors
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to submit answer. Please try again.";
          setErrorMessage(message);
        },
      }
    );
  }, [currentAttempt, currentQuestion, answers, submitResponse]);

  // Check if current question has an answer selected
  const hasCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (answer === null || answer === undefined) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === "string") return answer.length > 0;
    if (typeof answer === "boolean") return true;
    if (typeof answer === "object") return Object.keys(answer).length > 0;
    return false;
  }, [currentQuestion, answers]);

  // Check if current question is already submitted
  const isCurrentQuestionSubmitted = currentQuestion ? submittedQuestions.has(currentQuestion.id) : false;

  // Check if there are unanswered questions (for warning)
  const hasUnansweredQuestions = useMemo(() => {
    if (isPracticeExam) {
      // For practice exams, check if all submitted
      return !questions.every((q) => submittedQuestions.has(q.id));
    } else {
      // For regular exams, check if all answered
      return answeredQuestions.size < questions.length;
    }
  }, [isPracticeExam, questions, submittedQuestions, answeredQuestions]);

  // State for confirmation dialogs
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Prevent accidental page close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Handle exit exam
  const handleExitExam = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExitExam = useCallback(() => {
    if (!currentAttempt) return;

    // Pause the exam first
    pauseExam.mutate(currentAttempt.id, {
      onSuccess: () => {
        // Navigate to tests page
        navigate({ to: "/tests" });
      },
      onError: () => {
        // Even if pause fails, navigate anyway (progress is saved in store)
        navigate({ to: "/tests" });
      },
    });
  }, [currentAttempt, pauseExam, navigate]);

  // Actually complete the exam
  const confirmCompleteExam = useCallback(() => {
    if (!currentAttempt) return;

    setShowCompleteConfirm(false);
    setErrorMessage(""); // Clear any previous errors

    // Collect all unsubmitted answers
    const unsubmittedResponses = questions
      .filter((q) => {
        const answer = answers[q.id];
        const isSubmitted = submittedQuestions.has(q.id);
        // Has an answer but not yet submitted
        if (isSubmitted) return false;
        if (answer === null || answer === undefined) return false;
        if (Array.isArray(answer)) return answer.length > 0;
        if (typeof answer === "string") return answer.length > 0;
        if (typeof answer === "boolean") return true;
        if (typeof answer === "object") return Object.keys(answer).length > 0;
        return false;
      })
      .map((q) => {
        const answer = answers[q.id];
        // Format answer based on type
        let formattedAnswer: string | string[] | boolean = "";
        if (typeof answer === "boolean") {
          formattedAnswer = answer;
        } else if (Array.isArray(answer)) {
          formattedAnswer = answer;
        } else if (typeof answer === "object") {
          formattedAnswer = JSON.stringify(answer);
        } else {
          formattedAnswer = answer;
        }
        return {
          questionId: q.id,
          answer: formattedAnswer,
          timeSpentSeconds: 0, // We don't track time per question for bulk submission
        };
      });

    // If there are unsubmitted responses, submit them in bulk first
    if (unsubmittedResponses.length > 0) {
      submitResponsesBulk.mutate(
        {
          attemptId: currentAttempt.id,
          request: {
            responses: unsubmittedResponses,
            complete: true,
          },
        },
        {
          onSuccess: () => {
            navigate({ to: "/exam/review/$attemptId", params: { attemptId: currentAttempt.id } });
          },
          onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Failed to submit responses. Please try again.";
            setErrorMessage(message);
          },
        }
      );
    } else {
      // No unsubmitted responses, just complete the exam
      completeExam.mutate(currentAttempt.id, {
        onSuccess: () => {
            navigate({ to: "/exam/review/$attemptId", params: { attemptId: currentAttempt.id } });
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to complete exam. Please try again.";
          setErrorMessage(message);
        },
      });
    }
  }, [currentAttempt, questions, answers, submittedQuestions, submitResponsesBulk, completeExam, navigate]);

  // Handle complete exam button click
  const handleCompleteExam = useCallback(() => {
    // If there are unanswered questions, show confirmation
    if (hasUnansweredQuestions) {
      setShowCompleteConfirm(true);
    } else {
      // Otherwise, complete directly
      confirmCompleteExam();
    }
  }, [hasUnansweredQuestions, confirmCompleteExam]);

  // Auto-complete exam when timer reaches zero
  useEffect(() => {
    if (timeRemaining === 0 && timerRunning && currentAttempt) {
      confirmCompleteExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  // Handle pause/resume toggle
  const handlePauseToggle = useCallback(() => {
    if (!currentAttempt) return;

    if (timerRunning) {
      pauseExam.mutate(currentAttempt.id, {
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to pause exam.";
          setErrorMessage(message);
        },
      });
    } else {
      resumeExam.mutate(currentAttempt.id, {
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to resume exam.";
          setErrorMessage(message);
        },
      });
    }
  }, [currentAttempt, timerRunning, pauseExam, resumeExam]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    const wasBookmarked = bookmarkedQuestions.has(questionId);

    // Toggle local state immediately for responsiveness
    setBookmarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });

    // Call API
    toggleBookmark.mutate(
      { questionId },
      {
        onError: (error: any) => {
          // Revert on error
          setBookmarkedQuestions((prev) => {
            const newSet = new Set(prev);
            if (wasBookmarked) {
              newSet.add(questionId);
            } else {
              newSet.delete(questionId);
            }
            return newSet;
          });
          const message = error?.response?.data?.message || error?.message || "Failed to update bookmark.";
          setErrorMessage(message);
        },
      }
    );
  }, [currentQuestion, bookmarkedQuestions, toggleBookmark]);

  // Handle report submission
  const handleReportSubmit = useCallback(() => {
    if (!currentQuestion || !reportReason.trim()) return;

    reportQuestion.mutate(
      {
        questionId: currentQuestion.id,
        reason: reportReason,
      },
      {
        onSuccess: () => {
          setShowReportModal(false);
          setReportReason("");
          setErrorMessage(""); // Clear any previous errors
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to submit report. Please try again.";
          setErrorMessage(message);
        },
      }
    );
  }, [currentQuestion, reportReason, reportQuestion]);

  // Loading state while fetching exam from API
  if (isLoadingExam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F04F54] mx-auto mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Error state - couldn't load exam
  if (loadError || !currentAttempt || questions.length === 0) {
    return (
      <div className="py-10">
        <Link to="/tests" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-semibold mb-4">Exam Not Found</h1>
        <p className="text-gray-500 mb-2">
          {loadError || "This exam session has expired or is no longer available."}
        </p>
        <p className="text-gray-500 mb-4">Please start a new exam from the tests page.</p>
        <Link to="/tests">
          <Button className="mt-4 bg-[#F04F54] hover:bg-[#F04F54]/90">Go to Tests</Button>
        </Link>
      </div>
    );
  }

  // Get exam name from attempt
  const examName = currentAttempt.exam?.name || "Practice Exam";

  // Render the question based on type
  const renderQuestion = (question: Question) => {
    const questionId = question.id;
    const answer = answers[questionId];
    const isSubmitted = submittedQuestions.has(questionId);
    const showCorrectAnswer = isPracticeExam && isSubmitted;

    switch (question.questionType) {
      case "SINGLE_CHOICE":
        return (
          <SingleChoiceQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswer={(answer as string) || null}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isSubmitted}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswers={(answer as string[]) || []}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isSubmitted}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case "TRUE_FALSE":
        return (
          <TrueFalseQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswer={answer as boolean | null}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isSubmitted}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case "FILL_IN_BLANK":
        return (
          <FillInBlankQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answers={(answer as Record<string, string>) || {}}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isSubmitted}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case "ESSAY":
      case "ESSAY_WITH_SUB":
      case "SHORT_ANSWER":
        return (
          <EssayQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as string) || ""}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isSubmitted}
          />
        );

      default:
        // Fallback for unsupported question types
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600">Question {currentQuestionIndex + 1}</p>
            <div className="text-lg font-semibold">
              <RichContentRenderer content={question.questionText} />
            </div>
            <p className="text-yellow-600 text-sm">
              Question type "{question.questionType}" is not yet supported.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <button
            onClick={handleExitExam}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Exam</span>
            <span className="sm:hidden">Exit</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold mt-1">{examName}</h1>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Layout — stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Navigator — top on mobile, right sidebar on desktop */}
        <div className="w-full lg:w-72 lg:order-2 shrink-0">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentQuestion={currentQuestionIndex}
            answeredQuestions={answeredQuestions}
            submittedQuestions={new Set(
              questions
                .map((q, idx) => (submittedQuestions.has(q.id) ? idx : -1))
                .filter((idx) => idx !== -1)
            )}
            timeRemaining={timeRemaining ?? 0}
            isPaused={!timerRunning}
            isBookmarked={currentQuestion ? bookmarkedQuestions.has(currentQuestion.id) : false}
            isSubmitting={submitResponse.isPending}
            canSubmit={hasCurrentAnswer()}
            isCurrentSubmitted={isCurrentQuestionSubmitted}
            canCompleteExam={true}
            isCompletingExam={completeExam.isPending || submitResponsesBulk.isPending}
            onQuestionSelect={setCurrentQuestion}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onPauseToggle={handlePauseToggle}
            onBookmark={handleBookmarkToggle}
            onReport={() => setShowReportModal(true)}
            onSubmitAnswer={handleSubmitAnswer}
            onCompleteExam={handleCompleteExam}
          />
        </div>

        {/* Question Area */}
        <div className="flex-1 min-w-0 lg:order-1">
          {currentQuestion && (
            <QuestionCard instruction={currentQuestion.instruction}>
              {renderQuestion(currentQuestion)}

              {/* Show explanation after submission for practice exams */}
              {isPracticeExam &&
                submittedQuestions.has(currentQuestion.id) &&
                currentQuestion.explanation && (
                  <Explanation explanation={currentQuestion.explanation} />
              )}
            </QuestionCard>
          )}
        </div>
      </div>

      {/* Report Question Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Question</DialogTitle>
            <DialogDescription>
              Please describe the issue with this question.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F04F54]/50"
              >
                <option value="">Select a reason</option>
                <option value="INCORRECT_ANSWER">Incorrect answer marked as correct</option>
                <option value="UNCLEAR_QUESTION">Question is unclear</option>
                <option value="TYPO">Typo or grammatical error</option>
                <option value="INCORRECT_EXPLANATION">Incorrect explanation</option>
                <option value="IMAGE_ISSUE">Image issue</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReportModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportSubmit}
                disabled={!reportReason || reportQuestion.isPending}
                className="flex-1 bg-[#F04F54] hover:bg-[#F04F54]/90"
              >
                {reportQuestion.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Exam Confirmation Modal */}
      <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Exam?</DialogTitle>
            <DialogDescription>
              {isPracticeExam
                ? `You have ${questions.length - submittedQuestions.size} unsubmitted question(s). Once you complete the exam, you won't be able to return.`
                : `You have ${questions.length - answeredQuestions.size} unanswered question(s). Once you complete the exam, you won't be able to return.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCompleteConfirm(false)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              onClick={confirmCompleteExam}
              disabled={completeExam.isPending || submitResponsesBulk.isPending}
              className="flex-1 bg-[#F04F54] hover:bg-[#F04F54]/90"
            >
              {completeExam.isPending || submitResponsesBulk.isPending ? "Submitting..." : "Complete Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Exam Confirmation Modal */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exit Exam?</DialogTitle>
            <DialogDescription>
              Your progress will be saved and you can resume this exam later from the Activities page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowExitConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmExitExam}
              disabled={pauseExam.isPending}
              className="flex-1 bg-[#F04F54] hover:bg-[#F04F54]/90"
            >
              {pauseExam.isPending ? "Saving..." : "Exit Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/exam/$attemptId")({
  component: ExamPage,
  params: {
    parse: (params) => examParamsSchema.parse(params),
    stringify: (params) => params,
  },
});
