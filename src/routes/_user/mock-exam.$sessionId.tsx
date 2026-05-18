import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { z } from "zod";
import { ArrowLeft } from "@phosphor-icons/react";
import { CheckCircle2 } from "lucide-react";
import { useMockExamStore, cqKey } from "@/stores/mockExamStore";
import { useShallow } from "zustand/react/shallow";
import {
  useMockSubmitResponse,
  useCompleteMockExam,
  usePauseMockExam,
  useResumeMockExam,
} from "@/feature/mock-exam/hooks";
import {
  useToggleBookmark,
  useReportQuestion,
} from "@/feature/exams/hooks/useExams";
import {
  QuestionCard,
  QuestionNavigator,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  EssayQuestion,
  ShortAnswerQuestion,
  CalculationQuestion,
  OrderingQuestion,
  MatchingQuestion,
  RichContentRenderer,
} from "@/components/questions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Question } from "@/api/types/exam.types";

const mockExamParamsSchema = z.object({
  sessionId: z.string(),
});

type AnswerValue =
  | string
  | string[]
  | boolean
  | Record<string, string>
  | null;

function isAnswered(answer: any): boolean {
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.length > 0;
  if (typeof answer === "boolean") return true;
  if (typeof answer === "object") return Object.keys(answer).length > 0;
  return false;
}

function MockExamPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  const {
    sessionId: storedSessionId,
    subjects,
    currentSubjectIndex,
    currentPaperIndex,
    currentQuestionIndexes,
    timeRemaining,
    timerRunning,
  } = useMockExamStore(
    useShallow((state) => ({
      sessionId: state.sessionId,
      subjects: state.subjects,
      currentSubjectIndex: state.currentSubjectIndex,
      currentPaperIndex: state.currentPaperIndex,
      currentQuestionIndexes: state.currentQuestionIndexes,
      timeRemaining: state.timeRemaining,
      timerRunning: state.timerRunning,
    }))
  );

  const {
    setCurrentSubject,
    setCurrentPaper,
    setCurrentQuestion,
    nextQuestion,
    previousQuestion,
    setAnswer,
    updateTimeRemaining,
  } = useMockExamStore(
    useShallow((state) => ({
      setCurrentSubject: state.setCurrentSubject,
      setCurrentPaper: state.setCurrentPaper,
      setCurrentQuestion: state.setCurrentQuestion,
      nextQuestion: state.nextQuestion,
      previousQuestion: state.previousQuestion,
      setAnswer: state.setAnswer,
      updateTimeRemaining: state.updateTimeRemaining,
    }))
  );

  const isValidSession = storedSessionId === sessionId;
  const [loadError] = useState(!isValidSession ? "Exam session not found." : "");

  // Resolve the currently active subject and paper. The paper-tab row is
  // suppressed when there's only one paper (JAMB-style).
  const currentSubject = subjects[currentSubjectIndex] || null;
  const currentPaper = currentSubject?.papers[currentPaperIndex] || null;
  const currentQuestionIndex =
    currentQuestionIndexes[cqKey(currentSubjectIndex, currentPaperIndex)] ?? 0;
  const currentQuestion = currentPaper?.questions[currentQuestionIndex] || null;
  const currentAnswers = currentPaper?.answers || {};
  const hasMultiplePapers = (currentSubject?.papers.length ?? 0) > 1;

  // Hooks
  const submitResponse = useMockSubmitResponse();
  const completeMockExam = useCompleteMockExam();
  const pauseMockExam = usePauseMockExam();
  const resumeMockExam = useResumeMockExam();
  const toggleBookmark = useToggleBookmark();
  const reportQuestion = useReportQuestion();

  // Answered questions for the current paper.
  const answeredQuestions = useMemo(() => {
    if (!currentPaper) return new Set<number>();
    const answered = new Set<number>();
    currentPaper.questions.forEach((q, index) => {
      if (isAnswered(currentPaper.answers[q.id])) answered.add(index);
    });
    return answered;
  }, [currentPaper]);

  // Per-question timing — reset whenever the visible question changes
  // (subject, paper, or index).
  const questionStartTime = useRef<number>(Date.now());
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestionIndex, currentSubjectIndex, currentPaperIndex]);

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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an exam simulation in progress.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleAnswerChange = useCallback(
    (questionId: string, value: AnswerValue) => {
      setAnswer(currentSubjectIndex, currentPaperIndex, questionId, value);
    },
    [currentSubjectIndex, currentPaperIndex, setAnswer]
  );

  const handleSubmitAnswer = useCallback(() => {
    if (!currentPaper || !currentQuestion) return;
    const questionId = currentQuestion.id;
    const value = currentAnswers[questionId];
    if (value === null || value === undefined) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);

    let formattedAnswer: string | string[] | boolean = "";
    if (typeof value === "boolean") formattedAnswer = value;
    else if (Array.isArray(value)) formattedAnswer = value;
    else if (typeof value === "object") formattedAnswer = JSON.stringify(value);
    else formattedAnswer = value;

    submitResponse.mutate(
      {
        subjectIndex: currentSubjectIndex,
        paperIndex: currentPaperIndex,
        attemptId: currentPaper.attemptId,
        request: {
          questionId,
          answer: formattedAnswer,
          timeSpentSeconds: timeSpent,
        },
      },
      {
        onSuccess: () => setErrorMessage(""),
        onError: (error: any) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to submit answer."
          );
        },
      }
    );
  }, [
    currentPaper,
    currentQuestion,
    currentAnswers,
    currentSubjectIndex,
    currentPaperIndex,
    submitResponse,
  ]);

  const hasCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return false;
    return isAnswered(currentAnswers[currentQuestion.id]);
  }, [currentQuestion, currentAnswers]);

  // "Unanswered" check sums every question of every paper across every
  // subject — completing the simulation closes every paper at once.
  const hasUnansweredQuestions = useMemo(() => {
    let totalAnswered = 0;
    let totalQuestions = 0;
    subjects.forEach((s) => {
      s.papers.forEach((p) => {
        totalQuestions += p.questions.length;
        p.questions.forEach((q) => {
          if (isAnswered(p.answers[q.id])) totalAnswered++;
        });
      });
    });
    return totalAnswered < totalQuestions;
  }, [subjects]);

  const totalUnanswered = useMemo(() => {
    let count = 0;
    subjects.forEach((s) => {
      s.papers.forEach((p) => {
        p.questions.forEach((q) => {
          if (!isAnswered(p.answers[q.id])) count++;
        });
      });
    });
    return count;
  }, [subjects]);

  const confirmCompleteExam = useCallback(() => {
    setShowCompleteConfirm(false);
    setErrorMessage("");

    completeMockExam.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/mock-exam/review/$sessionId", params: { sessionId } });
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to complete exam."
        );
      },
    });
  }, [completeMockExam, navigate, sessionId]);

  const handleCompleteExam = useCallback(() => {
    if (hasUnansweredQuestions) {
      setShowCompleteConfirm(true);
    } else {
      confirmCompleteExam();
    }
  }, [hasUnansweredQuestions, confirmCompleteExam]);

  useEffect(() => {
    if (timeRemaining === 0 && timerRunning) {
      confirmCompleteExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  const handlePauseToggle = useCallback(() => {
    if (timerRunning) {
      pauseMockExam.mutate(undefined, {
        onError: (error: any) => {
          setErrorMessage(error?.response?.data?.message || "Failed to pause exam.");
        },
      });
    } else {
      resumeMockExam.mutate(undefined, {
        onError: (error: any) => {
          setErrorMessage(error?.response?.data?.message || "Failed to resume exam.");
        },
      });
    }
  }, [timerRunning, pauseMockExam, resumeMockExam]);

  const handleExitExam = useCallback(() => setShowExitConfirm(true), []);
  const confirmExitExam = useCallback(() => {
    pauseMockExam.mutate(undefined, {
      onSuccess: () => navigate({ to: "/tests" }),
      onError: () => navigate({ to: "/tests" }),
    });
  }, [pauseMockExam, navigate]);

  const handleBookmarkToggle = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    const was = bookmarkedQuestions.has(qId);
    setBookmarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
    toggleBookmark.mutate(
      { questionId: qId },
      {
        onError: () => {
          setBookmarkedQuestions((prev) => {
            const next = new Set(prev);
            if (was) next.add(qId);
            else next.delete(qId);
            return next;
          });
        },
      }
    );
  }, [currentQuestion, bookmarkedQuestions, toggleBookmark]);

  const handleReportSubmit = useCallback(() => {
    if (!currentQuestion || !reportReason.trim()) return;
    reportQuestion.mutate(
      { questionId: currentQuestion.id, reason: reportReason },
      {
        onSuccess: () => {
          setShowReportModal(false);
          setReportReason("");
        },
        onError: (error: any) => {
          setErrorMessage(error?.response?.data?.message || "Failed to submit report.");
        },
      }
    );
  }, [currentQuestion, reportReason, reportQuestion]);

  const renderQuestion = (question: Question) => {
    const questionId = question.id;
    const answer = currentAnswers[questionId];
    const isLocked = false;
    const showCorrectAnswer = false;

    switch (question.questionType) {
      case "SINGLE_CHOICE":
        return (
          <SingleChoiceQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswer={(answer as string) || null}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
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
            isSubmitted={isLocked}
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
            isSubmitted={isLocked}
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
            isSubmitted={isLocked}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case "ESSAY":
        return (
          <EssayQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as string) || ""}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
          />
        );
      case "ESSAY_WITH_SUB":
        return (
          <EssayQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as Record<string, string>) || {}}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
          />
        );
      case "SHORT_ANSWER":
        return (
          <ShortAnswerQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as string) || ""}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case "CALCULATION":
        return (
          <CalculationQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as Record<string, string>) || {}}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case "ORDERING":
        return (
          <OrderingQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answer={(answer as string[]) || []}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case "MATCHING":
        return (
          <MatchingQuestion
            question={question}
            questionNumber={currentQuestionIndex + 1}
            answers={(answer as Record<string, string>) || {}}
            onAnswerChange={(value) => handleAnswerChange(questionId, value)}
            isSubmitted={isLocked}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      default:
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1}
            </p>
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

  if (loadError || !isValidSession || subjects.length === 0) {
    return (
      <div className="py-10">
        <Link
          to="/tests"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <h1 className="text-2xl font-semibold mb-4">Session Not Found</h1>
        <p className="text-gray-500 mb-4">
          {loadError ||
            "This exam simulation session has expired or is no longer available."}
        </p>
        <Link to="/tests/exams">
          <Button className="mt-4 bg-[#F04F54] hover:bg-[#F04F54]/90">
            Go to Tests
          </Button>
        </Link>
      </div>
    );
  }

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
            <span className="hidden sm:inline">Exit Simulation</span>
            <span className="sm:hidden">Exit</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold mt-1">Exam Simulation</h1>
        </div>
      </div>

      {/* Subject tabs (row 1) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
        {subjects.map((session, index) => {
          const isActive = index === currentSubjectIndex;
          let subjectAnswered = 0;
          let totalQ = 0;
          session.papers.forEach((p) => {
            totalQ += p.questions.length;
            p.questions.forEach((q) => {
              if (isAnswered(p.answers[q.id])) subjectAnswered++;
            });
          });
          const allDone = totalQ > 0 && subjectAnswered === totalQ;

          return (
            <button
              key={session.subject.id + ":" + index}
              onClick={() => setCurrentSubject(index)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                isActive
                  ? "bg-[#F04F54] text-white border-[#F04F54] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {allDone && !isActive && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              )}
              <span className="truncate max-w-[120px]">{session.subject.name}</span>
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                {subjectAnswered}/{totalQ}
              </span>
            </button>
          );
        })}
      </div>

      {/* Paper tabs (row 2) — only when active subject has multiple papers */}
      {hasMultiplePapers && currentSubject && (
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {currentSubject.papers.map((paper, pIdx) => {
            const isActive = pIdx === currentPaperIndex;
            let answered = 0;
            paper.questions.forEach((q) => {
              if (isAnswered(paper.answers[q.id])) answered++;
            });
            const total = paper.questions.length;
            return (
              <button
                key={paper.attemptId}
                onClick={() => setCurrentPaper(pIdx)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  isActive
                    ? "bg-[#F04F54]/10 text-[#F04F54] border-[#F04F54]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <span>{paper.paperName}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-[#F04F54]/15" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {answered}/{total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="w-full lg:w-72 lg:order-2 shrink-0">
          {currentPaper && (
            <QuestionNavigator
              totalQuestions={currentPaper.questions.length}
              currentQuestion={currentQuestionIndex}
              answeredQuestions={answeredQuestions}
              submittedQuestions={new Set<number>()}
              correctQuestions={new Set<number>()}
              timeRemaining={timeRemaining ?? 0}
              isPaused={!timerRunning}
              isBookmarked={
                currentQuestion ? bookmarkedQuestions.has(currentQuestion.id) : false
              }
              isSubmitting={submitResponse.isPending}
              canSubmit={hasCurrentAnswer()}
              isCurrentSubmitted={false}
              canCompleteExam={true}
              isCompletingExam={completeMockExam.isPending}
              onQuestionSelect={setCurrentQuestion}
              onPrevious={previousQuestion}
              onNext={nextQuestion}
              onPauseToggle={handlePauseToggle}
              onBookmark={handleBookmarkToggle}
              onReport={() => setShowReportModal(true)}
              onSubmitAnswer={handleSubmitAnswer}
              onCompleteExam={handleCompleteExam}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 lg:order-1">
          {currentQuestion && (
            <QuestionCard instruction={currentQuestion.instruction}>
              {renderQuestion(currentQuestion)}
            </QuestionCard>
          )}
        </div>
      </div>

      {/* Report Modal */}
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

      {/* Complete Confirmation */}
      <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Simulation?</DialogTitle>
            <DialogDescription>
              You have {totalUnanswered} unanswered question(s) across all subjects. Once you
              complete the simulation, you won't be able to return.
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
              disabled={completeMockExam.isPending}
              className="flex-1 bg-[#F04F54] hover:bg-[#F04F54]/90"
            >
              {completeMockExam.isPending ? "Completing..." : "Complete Simulation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Confirmation */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exit Simulation?</DialogTitle>
            <DialogDescription>
              Your progress will be saved and you can resume later from the Activities page.
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
              disabled={pauseMockExam.isPending}
              className="flex-1 bg-[#F04F54] hover:bg-[#F04F54]/90"
            >
              {pauseMockExam.isPending ? "Saving..." : "Exit Simulation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/mock-exam/$sessionId")({
  component: MockExamPage,
  params: {
    parse: (params) => mockExamParamsSchema.parse(params),
    stringify: (params) => params,
  },
});
