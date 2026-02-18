import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Pause, Play, BookmarkSimple } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>; // 0-indexed question numbers that have been answered
  submittedQuestions: Set<number>; // 0-indexed question numbers that have been submitted
  correctQuestions?: Set<number>; // 0-indexed question numbers answered correctly
  timeRemaining: number; // in seconds
  isPaused?: boolean;
  isBookmarked?: boolean;
  isSubmitting?: boolean;
  canSubmit?: boolean; // Whether current question has an answer to submit
  isCurrentSubmitted?: boolean; // Whether current question is already submitted
  canCompleteExam?: boolean; // Whether all questions are handled
  isCompletingExam?: boolean; // Whether exam completion is in progress
  onQuestionSelect: (questionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onPauseToggle?: () => void;
  onBookmark?: () => void;
  onReport?: () => void;
  onSubmitAnswer?: () => void;
  onCompleteExam?: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  submittedQuestions,
  timeRemaining,
  isPaused = false,
  isBookmarked = false,
  isSubmitting = false,
  canSubmit = false,
  isCurrentSubmitted = false,
  canCompleteExam = false,
  isCompletingExam = false,
  onQuestionSelect,
  onPrevious,
  onNext,
  onPauseToggle,
  onBookmark,
  onReport,
  onSubmitAnswer,
  correctQuestions = new Set<number>(),
  onCompleteExam,
}: QuestionNavigatorProps) {
  // Generate array of question numbers - memoized to prevent recreation on every render
  const questions = useMemo(() => Array.from({ length: totalQuestions }, (_, i) => i), [totalQuestions]);

  return (
    <Card className="p-3 sm:p-4 lg:sticky lg:top-4 max-h-[80vh] lg:max-h-[calc(100vh-2rem)] flex flex-col gap-3 sm:gap-4">
      {/* Timer Header — always visible */}
      <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg p-2.5 sm:p-3 shrink-0">
        {onPauseToggle && (
          <button
            onClick={onPauseToggle}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? (
              <Play weight="fill" className="w-4 h-4 text-gray-600" />
            ) : (
              <Pause weight="fill" className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}

        <div className="flex-1 text-center">
          <span className={cn(
            "font-mono text-base sm:text-lg font-semibold",
            timeRemaining < 300 && "text-red-500"
          )}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {onBookmark && (
          <button
            onClick={onBookmark}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              isBookmarked ? "bg-[#F04F54] text-white" : "bg-gray-100 hover:bg-gray-200"
            )}
          >
            <BookmarkSimple
              weight={isBookmarked ? "fill" : "regular"}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {/* Question Grid — scrollable */}
      <div className="min-h-0 overflow-y-auto overscroll-contain shrink">
        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-6 gap-1.5 sm:gap-2">
          {questions.map((qIndex) => {
            const isCurrent = qIndex === currentQuestion;
            const isAnswered = answeredQuestions.has(qIndex);
            const isSubmitted = submittedQuestions.has(qIndex);
            const isCorrect = correctQuestions.has(qIndex);

            return (
              <button
                key={qIndex}
                onClick={() => onQuestionSelect(qIndex)}
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50",
                  isCurrent && "bg-blue-600 text-white ring-2 ring-blue-400/50",
                  !isCurrent && isSubmitted && isCorrect && "bg-green-500 text-white",
                  !isCurrent && isSubmitted && !isCorrect && "bg-red-500 text-white",
                  !isCurrent && !isSubmitted && isAnswered && "bg-yellow-100 text-yellow-700 border border-yellow-300",
                  !isCurrent && !isAnswered && "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {qIndex + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Current</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Correct</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Wrong</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-100 border border-yellow-300 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Unanswered</span>
        </div>
      </div>

      {/* Action Buttons — always visible at bottom */}
      <div className="shrink-0 space-y-2">
        {/* Submit Answer Button */}
        {onSubmitAnswer && (
          <Button
            onClick={onSubmitAnswer}
            disabled={!canSubmit || isSubmitting || isCurrentSubmitted}
            className={cn(
              "w-full rounded-full text-sm",
              isCurrentSubmitted
                ? "bg-green-500 hover:bg-green-500 cursor-default"
                : "bg-[#F04F54] hover:bg-[#F04F54]/90"
            )}
          >
            {isSubmitting ? "Submitting..." : isCurrentSubmitted ? "Submitted ✓" : "Submit Answer"}
          </Button>
        )}

        {/* Nav row: Previous + Next side by side */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentQuestion === 0}
            className="rounded-full text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentQuestion === totalQuestions - 1}
            className="rounded-full text-sm"
          >
            Next
          </Button>
        </div>

        {/* Report + Complete row */}
        {(onReport || onCompleteExam) && (
          <div className="grid grid-cols-2 gap-2">
            {onReport && (
              <Button
                variant="outline"
                onClick={onReport}
                className="rounded-full border-[#F04F54] text-[#F04F54] hover:bg-red-50 text-xs sm:text-sm"
              >
                Report
              </Button>
            )}
            {onCompleteExam && (
              <Button
                onClick={onCompleteExam}
                disabled={!canCompleteExam || isCompletingExam}
                className={cn(
                  "rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm",
                  !onReport && "col-span-2"
                )}
              >
                {isCompletingExam ? "Completing..." : "Complete Exam"}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
