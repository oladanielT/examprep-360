import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Trophy,
  ChevronLeft,
  ChevronRight,
  MinusCircle,
} from "lucide-react";
import { useExamReview } from "@/feature/exams/hooks/useExams";
import {
  QuestionCard,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  FillInBlankQuestion,
  TrueFalseQuestion,
  EssayQuestion,
  RichContentRenderer,
  Explanation,
} from "@/components/questions";
import { cn } from "@/lib/utils";

const reviewParamsSchema = z.object({
  attemptId: z.string(),
});

function ExamReviewPage() {
  const { attemptId } = Route.useParams();
  const { data: review, isLoading, isError } = useExamReview(attemptId);
  const [currentIndex, setCurrentIndex] = useState(0);

  // All hooks must be called before any early returns (Rules of Hooks)
  const responses = review?.responses || [];
  const examQuestions = review?.exam?.questions || [];

  const allItems = useMemo(() => {
    const responseMap = new Map(responses.map((r: any) => [r.questionId, r]));
    if (examQuestions.length > 0) {
      return [...examQuestions]
        .sort((a: any, b: any) => a.order - b.order)
        .map((eq: any) => ({
          question: eq.question,
          response: responseMap.get(eq.questionId) || null,
        }));
    }
    return responses.map((r: any) => ({
      question: r.question,
      response: r,
    }));
  }, [examQuestions, responses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="py-10">
        <Link
          to="/activities"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Link>
        <div className="text-center py-16 space-y-3">
          <XCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">Could not load exam review.</p>
        </div>
      </div>
    );
  }

  const isPractice = review.exam?.examTypeEnum === "PRACTICE";

  const totalQuestions = review.exam?.numQuestions || allItems.length;
  const essayTypes = new Set(["ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER"]);
  const correctCount = responses.filter((r: any) => r.isCorrect).length;
  const essayResponseCount = responses.filter((r: any) => essayTypes.has(r.question?.questionType)).length;
  const answeredWrongCount = responses.filter((r: any) => !r.isCorrect && !essayTypes.has(r.question?.questionType) && r.answer !== null && r.answer !== undefined && r.answer !== "").length;
  const skippedCount = totalQuestions - correctCount - answeredWrongCount - essayResponseCount;
  const incorrectCount = answeredWrongCount;
  const percentage = review.percentage ?? 0;
  const passed = review.passed ?? false;
  const timeSpent = review.timeSpentSeconds ?? 0;
  const examName = review.exam?.name || "Exam";
  const subjectName = review.exam?.subject?.name || "";
  const examTypeName = review.exam?.examType?.name || "";

  const currentItem = allItems[currentIndex];
  const currentQuestion = currentItem?.question;
  const currentResponse = currentItem?.response;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < allItems.length) setCurrentIndex(index);
  };

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <Link
        to="/activities"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Score Summary Banner */}
      <div
        className={cn(
          "rounded-2xl p-5 sm:p-7 mb-6 sm:mb-8 border",
          passed
            ? "bg-emerald-50/80 border-emerald-200"
            : "bg-red-50/80 border-red-200"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          {/* Score circle */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0 border-4",
                passed
                  ? "border-emerald-400 bg-emerald-100"
                  : "border-red-400 bg-red-100"
              )}
            >
              <span
                className={cn(
                  "text-xl sm:text-2xl font-bold",
                  passed ? "text-emerald-700" : "text-red-700"
                )}
              >
                {Math.round(percentage)}%
              </span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {examName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {[examTypeName, subjectName].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {passed ? (
                  <Trophy className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    passed ? "text-emerald-700" : "text-red-600"
                  )}
                >
                  {passed ? "Passed" : "Failed"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3 sm:ml-auto">
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <Target className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {review.totalScore}/{totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-700 font-medium">{correctCount} correct</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-gray-700 font-medium">{incorrectCount} wrong</span>
            </div>
            {skippedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
                <MinusCircle className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700 font-medium">{skippedCount} skipped</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: navigator + question */}
      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
        {/* Question navigator — horizontal scroll on mobile, sidebar on desktop */}
        <div className="w-full lg:w-56 shrink-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2.5">
            Questions
          </p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {allItems.map((item: any, idx: number) => {
              const isActive = idx === currentIndex;
              const hasResponse = !!item.response;
              const isCorrect = item.response?.isCorrect;
              const isSkipped = !hasResponse;
              const isEssayType = item.question && ["ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER"].includes(item.question.questionType);

              // For practice: show green/red for correct/wrong
              // For mock: show neutral colors (answered vs skipped)
              // For essay types: always show amber (not auto-graded)
              const getIndicatorClass = () => {
                if (isActive) return "bg-white/20 text-white";
                if (isSkipped) return "bg-gray-100 text-gray-400";
                if (isEssayType) return "bg-amber-100 text-amber-700";
                if (isPractice) {
                  return isCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600";
                }
                // Mock: just show as answered (blue)
                return "bg-blue-100 text-blue-700";
              };

              const getIcon = () => {
                if (isSkipped) return <MinusCircle className="inline w-3.5 h-3.5 ml-1 text-gray-300" />;
                if (isEssayType) return <Clock className="inline w-3.5 h-3.5 ml-1 text-amber-400" />;
                if (isPractice) {
                  return isCorrect
                    ? <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 text-emerald-400" />
                    : <XCircle className="inline w-3.5 h-3.5 ml-1 text-red-400" />;
                }
                return <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 text-blue-400" />;
              };

              return (
                <button
                  key={item.question?.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      getIndicatorClass()
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="hidden lg:inline truncate">
                    Q{idx + 1}
                    {getIcon()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 min-w-0">
          {currentQuestion && (
            <div className="space-y-4">
              {/* Result badge */}
              <div className="flex items-center justify-between">
                {(() => {
                  const isEssayType = ["ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER"].includes(currentQuestion.questionType);

                  if (!currentResponse) {
                    return (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        <MinusCircle className="w-3.5 h-3.5" />
                        Not Attempted
                      </div>
                    );
                  }

                  if (isEssayType) {
                    return (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Not Auto-Graded
                      </div>
                    );
                  }

                  return (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                        isPractice
                          ? currentResponse.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {isPractice ? (
                        currentResponse.isCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {isPractice
                        ? currentResponse.isCorrect ? "Correct" : "Incorrect"
                        : "Answered"}
                      <span className="text-[10px] opacity-70 ml-1">
                        ({currentResponse.marksAwarded}/{currentQuestion.marks} marks)
                      </span>
                    </div>
                  );
                })()}
                {currentResponse?.timeSpentSeconds != null && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(currentResponse.timeSpentSeconds)}
                  </span>
                )}
              </div>

              <QuestionCard instruction={currentQuestion.instruction}>
                {/* Render by question type */}
                {currentQuestion.questionType === "SINGLE_CHOICE" && (
                  <SingleChoiceQuestion
                    question={currentQuestion}
                    questionNumber={currentQuestion.questionNumber}
                    selectedAnswer={
                      currentResponse && typeof currentResponse.answer === "string"
                        ? currentResponse.answer
                        : null
                    }
                    onAnswerChange={() => {}}
                    isSubmitted
                    disabled
                    showCorrectAnswer
                  />
                )}

                {currentQuestion.questionType === "MULTIPLE_CHOICE" && (
                  <MultipleChoiceQuestion
                    question={currentQuestion}
                    questionNumber={currentQuestion.questionNumber}
                    selectedAnswers={
                      currentResponse && Array.isArray(currentResponse.answer)
                        ? currentResponse.answer
                        : []
                    }
                    onAnswerChange={() => {}}
                    isSubmitted
                    disabled
                    showCorrectAnswer
                  />
                )}

                {currentQuestion.questionType === "TRUE_FALSE" && (
                  <TrueFalseQuestion
                    question={currentQuestion}
                    questionNumber={currentQuestion.questionNumber}
                    selectedAnswer={
                      currentResponse && typeof currentResponse.answer === "boolean"
                        ? currentResponse.answer
                        : null
                    }
                    onAnswerChange={() => {}}
                    isSubmitted
                    disabled
                    showCorrectAnswer
                  />
                )}

                {currentQuestion.questionType === "FILL_IN_BLANK" && (
                  <FillInBlankQuestion
                    question={currentQuestion}
                    questionNumber={currentQuestion.questionNumber}
                    answers={
                      currentResponse &&
                      typeof currentResponse.answer === "object" &&
                      !Array.isArray(currentResponse.answer)
                        ? (currentResponse.answer as Record<string, string>)
                        : {}
                    }
                    onAnswerChange={() => {}}
                    isSubmitted
                    disabled
                    showCorrectAnswer
                  />
                )}

                {(currentQuestion.questionType === "ESSAY" ||
                  currentQuestion.questionType === "ESSAY_WITH_SUB" ||
                  currentQuestion.questionType === "SHORT_ANSWER") && (
                  <EssayQuestion
                    question={currentQuestion}
                    questionNumber={currentQuestion.questionNumber}
                    answer={
                      currentResponse && typeof currentResponse.answer === "string"
                        ? currentResponse.answer
                        : ""
                    }
                    onAnswerChange={() => {}}
                    isSubmitted
                    disabled
                  />
                )}

                {/* Fallback for unsupported types */}
                {![
                  "SINGLE_CHOICE",
                  "MULTIPLE_CHOICE",
                  "TRUE_FALSE",
                  "FILL_IN_BLANK",
                  "ESSAY",
                  "ESSAY_WITH_SUB",
                  "SHORT_ANSWER",
                ].includes(currentQuestion.questionType) && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-600">
                      Question {currentQuestion.questionNumber}
                    </p>
                    <div className="text-lg font-semibold text-gray-900">
                      <RichContentRenderer
                        content={currentQuestion.questionText}
                      />
                    </div>
                    {currentResponse && (
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium mb-1">Your answer:</p>
                        <p>{JSON.stringify(currentResponse.answer)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                {currentQuestion.explanation && (
                  <Explanation explanation={currentQuestion.explanation} />
                )}

                {/* Text explanation fallback */}
                {!currentQuestion.explanation &&
                  (currentQuestion as any).textExplanation && (
                    <div className="mt-6 pt-6 border-t space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Explanation
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {(currentQuestion as any).textExplanation}
                      </p>
                    </div>
                  )}
              </QuestionCard>

              {/* Prev/Next Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  {currentIndex + 1} / {allItems.length}
                </span>
                <button
                  onClick={() => goTo(currentIndex + 1)}
                  disabled={currentIndex === allItems.length - 1}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/exam/review/$attemptId")({
  component: ExamReviewPage,
  params: {
    parse: (params) => reviewParamsSchema.parse(params),
    stringify: (params) => params,
  },
});
