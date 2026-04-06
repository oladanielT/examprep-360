import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
  BookOpen,
} from "lucide-react";
import { useExamReview } from "@/feature/exams/hooks/useExams";
import { useMockExamStore } from "@/stores/mockExamStore";
import {
  QuestionCard,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  FillInBlankQuestion,
  TrueFalseQuestion,
  EssayQuestion,
  ShortAnswerQuestion,
  CalculationQuestion,
  OrderingQuestion,
  MatchingQuestion,
  RichContentRenderer,
  Explanation,
} from "@/components/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const reviewParamsSchema = z.object({
  sessionId: z.string(),
});

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function MockExamReviewPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const { sessionId: storedSessionId, subjects } = useMockExamStore();

  const isValidSession = storedSessionId === sessionId;
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch reviews for all subjects
  const attemptIds = subjects.map((s) => s.attemptId);
  const review0 = useExamReview(attemptIds[0] || "");
  const review1 = useExamReview(attemptIds[1] || "");
  const review2 = useExamReview(attemptIds[2] || "");
  const review3 = useExamReview(attemptIds[3] || "");
  const review4 = useExamReview(attemptIds[4] || "");
  const review5 = useExamReview(attemptIds[5] || "");

  const allReviewHooks = [review0, review1, review2, review3, review4, review5];
  const reviews = subjects.map((_, i) => allReviewHooks[i]);
  const isLoading = reviews.some((r, i) => i < subjects.length && r.isLoading);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalSkipped = 0;
    let totalTimeSpent = 0;
    const essayTypes = new Set(["ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER"]);

    const perSubject: Array<{
      name: string;
      score: number;
      total: number;
      percentage: number;
      passed: boolean;
      correct: number;
      wrong: number;
      skipped: number;
    }> = [];

    subjects.forEach((session, i) => {
      const review = reviews[i]?.data;
      if (!review) {
        perSubject.push({
          name: session.subject.name,
          score: 0,
          total: session.questions.length,
          percentage: 0,
          passed: false,
          correct: 0,
          wrong: 0,
          skipped: session.questions.length,
        });
        return;
      }

      const responses = review.responses || [];
      const numQ = review.exam?.numQuestions || session.questions.length;
      const correct = responses.filter((r: any) => r.isCorrect).length;
      const essayCount = responses.filter((r: any) => essayTypes.has(r.question?.questionType)).length;
      const wrong = responses.filter(
        (r: any) => !r.isCorrect && !essayTypes.has(r.question?.questionType) && r.answer !== null && r.answer !== undefined && r.answer !== ""
      ).length;
      const skipped = numQ - correct - wrong - essayCount;

      // Use correct count as score so skipped questions count against the total
      const subjectPercentage = numQ > 0 ? Math.round((correct / numQ) * 100) : 0;
      const passingScore = (review.exam as any)?.passingScore ?? 50;
      const subjectPassed = subjectPercentage >= passingScore;

      totalScore += correct;
      totalQuestions += numQ;
      totalCorrect += correct;
      totalWrong += wrong;
      totalSkipped += skipped;
      totalTimeSpent += review.timeSpentSeconds || 0;

      perSubject.push({
        name: session.subject.name,
        score: correct,
        total: numQ,
        percentage: subjectPercentage,
        passed: subjectPassed,
        correct,
        wrong,
        skipped,
      });
    });

    const overallPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const overallPassed = perSubject.every((s) => s.passed);

    return {
      totalScore,
      totalQuestions,
      totalCorrect,
      totalWrong,
      totalSkipped,
      totalTimeSpent,
      overallPercentage,
      overallPassed,
      perSubject,
    };
  }, [subjects, reviews]);

  // Current subject review data
  const activeReview = reviews[activeSubjectIndex]?.data;
  const activeSession = subjects[activeSubjectIndex];

  const allItems = useMemo(() => {
    if (!activeReview) return [];
    const responses = activeReview.responses || [];
    const examQuestions = activeReview.exam?.questions || [];
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
  }, [activeReview]);

  // Reset question index when switching subjects
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [activeSubjectIndex]);

  const currentItem = allItems[currentQuestionIndex];
  const currentQuestion = currentItem?.question;
  const currentResponse = currentItem?.response;

  if (!isValidSession || subjects.length === 0) {
    return (
      <div className="py-10">
        <Link to="/activities" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="text-center py-16 space-y-3">
          <XCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">Exam simulation session not found.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
      </div>
    );
  }

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

      {/* Overall Score Banner */}
      <div
        className={cn(
          "rounded-2xl p-5 sm:p-7 mb-6 border",
          aggregateStats.overallPassed
            ? "bg-emerald-50/80 border-emerald-200"
            : "bg-red-50/80 border-red-200"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0 border-4",
                aggregateStats.overallPassed
                  ? "border-emerald-400 bg-emerald-100"
                  : "border-red-400 bg-red-100"
              )}
            >
              <span
                className={cn(
                  "text-xl sm:text-2xl font-bold",
                  aggregateStats.overallPassed ? "text-emerald-700" : "text-red-700"
                )}
              >
                {aggregateStats.overallPercentage}%
              </span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Exam Simulation Results
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {subjects.length} subjects combined
              </p>
              <div className="flex items-center gap-1 mt-1">
                {aggregateStats.overallPassed ? (
                  <Trophy className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    aggregateStats.overallPassed ? "text-emerald-700" : "text-red-600"
                  )}
                >
                  {aggregateStats.overallPassed ? "Passed" : "Failed"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 sm:ml-auto">
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <Target className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {aggregateStats.totalScore}/{aggregateStats.totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-gray-700 font-medium">{aggregateStats.totalCorrect} correct</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-gray-700 font-medium">{aggregateStats.totalWrong} wrong</span>
            </div>
            {aggregateStats.totalSkipped > 0 && (
              <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
                <MinusCircle className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700 font-medium">{aggregateStats.totalSkipped} skipped</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 text-xs sm:text-sm border border-gray-200">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">{formatTime(aggregateStats.totalTimeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Subject Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {aggregateStats.perSubject.map((subj, i) => (
          <button
            key={i}
            onClick={() => setActiveSubjectIndex(i)}
            className="text-left"
          >
            <Card
              className={cn(
                "rounded-2xl p-4 sm:p-5 transition-all border-2 cursor-pointer hover:shadow-md",
                i === activeSubjectIndex
                  ? "border-[#F04F54] shadow-md"
                  : "border-gray-100 hover:border-gray-200"
              )}
            >
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 truncate">
                {subj.name}
              </p>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-2xl sm:text-3xl font-bold",
                      subj.passed ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {Math.round(subj.percentage)}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {subj.score}/{subj.total}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    subj.passed ? "bg-emerald-100" : "bg-red-100"
                  )}
                >
                  {subj.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2 text-[10px] text-gray-400">
                <span className="text-emerald-500">{subj.correct} correct</span>
                <span className="text-red-400">{subj.wrong} wrong</span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Subject Detail Review */}
      {activeSession && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-[#F04F54]" />
            <h2 className="text-lg font-semibold text-gray-900">
              {activeSession.subject.name} — Question Review
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
            {/* Question navigator */}
            <div className="w-full lg:w-56 shrink-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2.5">
                Questions
              </p>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
                {allItems.map((item: any, idx: number) => {
                  const isActive = idx === currentQuestionIndex;
                  const hasResponse = !!item.response;
                  const isCorrect = item.response?.isCorrect;
                  const isSkipped = !hasResponse;
                  const isEssayType = item.question && ["ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER"].includes(item.question.questionType);

                  const getIndicatorClass = () => {
                    if (isActive) return "bg-white/20 text-white";
                    if (isSkipped) return "bg-gray-100 text-gray-400";
                    if (isEssayType) return "bg-amber-100 text-amber-700";
                    return isCorrect
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600";
                  };

                  const getIcon = () => {
                    if (isSkipped) return <MinusCircle className="inline w-3.5 h-3.5 ml-1 text-gray-300" />;
                    if (isEssayType) return <Clock className="inline w-3.5 h-3.5 ml-1 text-amber-400" />;
                    return isCorrect
                      ? <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 text-emerald-400" />
                      : <XCircle className="inline w-3.5 h-3.5 ml-1 text-red-400" />;
                  };

                  return (
                    <button
                      key={item.question?.id || idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
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
                            currentResponse.isCorrect
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          )}
                        >
                          {currentResponse.isCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {currentResponse.isCorrect ? "Correct" : "Incorrect"}
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
                    {/* Render question by type (read-only) */}
                    {currentQuestion.questionType === "SINGLE_CHOICE" && (
                      <SingleChoiceQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        selectedAnswer={typeof currentResponse?.answer === "string" ? currentResponse.answer : null}
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
                        selectedAnswers={Array.isArray(currentResponse?.answer) ? currentResponse.answer : []}
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
                        selectedAnswer={typeof currentResponse?.answer === "boolean" ? currentResponse.answer : null}
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
                          currentResponse?.answer && typeof currentResponse.answer === "object" && !Array.isArray(currentResponse.answer)
                            ? (currentResponse.answer as Record<string, string>)
                            : {}
                        }
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                        showCorrectAnswer
                      />
                    )}
                    {currentQuestion.questionType === "ESSAY" && (
                      <EssayQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answer={typeof currentResponse?.answer === "string" ? currentResponse.answer : ""}
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                      />
                    )}
                    {currentQuestion.questionType === "ESSAY_WITH_SUB" && (
                      <EssayQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answer={
                          currentResponse?.answer && typeof currentResponse.answer === "object" && !Array.isArray(currentResponse.answer)
                            ? (currentResponse.answer as Record<string, string>)
                            : {}
                        }
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                      />
                    )}
                    {currentQuestion.questionType === "SHORT_ANSWER" && (
                      <ShortAnswerQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answer={typeof currentResponse?.answer === "string" ? currentResponse.answer : ""}
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                        showCorrectAnswer
                      />
                    )}
                    {currentQuestion.questionType === "CALCULATION" && (
                      <CalculationQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answer={
                          currentResponse?.answer && typeof currentResponse.answer === "object" && !Array.isArray(currentResponse.answer)
                            ? (currentResponse.answer as Record<string, string>)
                            : {}
                        }
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                        showCorrectAnswer
                      />
                    )}
                    {currentQuestion.questionType === "ORDERING" && (
                      <OrderingQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answer={Array.isArray(currentResponse?.answer) ? (currentResponse.answer as string[]) : []}
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                        showCorrectAnswer
                      />
                    )}
                    {currentQuestion.questionType === "MATCHING" && (
                      <MatchingQuestion
                        question={currentQuestion}
                        questionNumber={currentQuestion.questionNumber}
                        answers={
                          currentResponse?.answer && typeof currentResponse.answer === "object" && !Array.isArray(currentResponse.answer)
                            ? (currentResponse.answer as Record<string, string>)
                            : {}
                        }
                        onAnswerChange={() => {}}
                        isSubmitted
                        disabled
                        showCorrectAnswer
                      />
                    )}

                    {/* Fallback */}
                    {![
                      "SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK",
                      "ESSAY", "ESSAY_WITH_SUB", "SHORT_ANSWER", "CALCULATION", "ORDERING", "MATCHING",
                    ].includes(currentQuestion.questionType) && (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-600">Question {currentQuestion.questionNumber}</p>
                        <div className="text-lg font-semibold text-gray-900">
                          <RichContentRenderer content={currentQuestion.questionText} />
                        </div>
                        {currentResponse && (
                          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                            <p className="font-medium mb-1">Your answer:</p>
                            <p>{JSON.stringify(currentResponse.answer)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {currentQuestion.explanation && (
                      <Explanation explanation={currentQuestion.explanation} />
                    )}
                  </QuestionCard>

                  {/* Prev/Next */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <span className="text-xs text-gray-400">
                      {currentQuestionIndex + 1} / {allItems.length}
                    </span>
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(allItems.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === allItems.length - 1}
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
        </>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/tests/exams" })}
          className="rounded-full px-6"
        >
          Back to Tests
        </Button>
        <Button
          onClick={() => navigate({ to: "/mock-exam/setup" })}
          className="rounded-full px-6 bg-[#F04F54] hover:bg-[#F04F54]/90 text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/mock-exam/review/$sessionId")({
  component: MockExamReviewPage,
  params: {
    parse: (params) => reviewParamsSchema.parse(params),
    stringify: (params) => params,
  },
});
