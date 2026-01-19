import { cn } from "@/lib/utils";
import { Pause, Play, BookmarkSimple } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>; // 0-indexed question numbers that have been answered
  timeRemaining: number; // in seconds
  isPaused?: boolean;
  isBookmarked?: boolean;
  onQuestionSelect: (questionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onPauseToggle?: () => void;
  onBookmark?: () => void;
  onReport?: () => void;
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
  timeRemaining,
  isPaused = false,
  isBookmarked = false,
  onQuestionSelect,
  onPrevious,
  onNext,
  onPauseToggle,
  onBookmark,
  onReport,
}: QuestionNavigatorProps) {
  // Generate array of question numbers
  const questions = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <Card className="p-4 space-y-4 sticky top-4">
      {/* Timer Header */}
      <div className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg p-3">
        {onPauseToggle && (
          <button
            onClick={onPauseToggle}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
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
            "font-mono text-lg font-semibold",
            timeRemaining < 300 && "text-red-500" // Less than 5 minutes
          )}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {onBookmark && (
          <button
            onClick={onBookmark}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
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

      {/* Question Grid */}
      <div className="grid grid-cols-6 gap-2">
        {questions.map((qIndex) => {
          const isCurrent = qIndex === currentQuestion;
          const isAnswered = answeredQuestions.has(qIndex);

          return (
            <button
              key={qIndex}
              onClick={() => onQuestionSelect(qIndex)}
              className={cn(
                "w-9 h-9 rounded-full text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#F04F54]/50",
                isCurrent && "bg-green-500 text-white",
                !isCurrent && isAnswered && "bg-green-100 text-green-700 border border-green-300",
                !isCurrent && !isAnswered && "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {qIndex + 1}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="flex-1 rounded-full"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={currentQuestion === totalQuestions - 1}
          className="flex-1 rounded-full"
        >
          Next
        </Button>
      </div>

      {/* Report Button */}
      {onReport && (
        <Button
          variant="outline"
          onClick={onReport}
          className="w-full rounded-full border-[#F04F54] text-[#F04F54] hover:bg-red-50"
        >
          Report Question
        </Button>
      )}
    </Card>
  );
}
