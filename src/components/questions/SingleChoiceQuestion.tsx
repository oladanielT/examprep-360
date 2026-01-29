import { cn } from "@/lib/utils";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question, ChoiceOption } from "@/api/types/exam.types";

interface SingleChoiceQuestionProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | null;
  onAnswerChange: (answer: string | null) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function SingleChoiceQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: SingleChoiceQuestionProps) {
  const options = question.options || [];

  const handleOptionClick = (optionId: string) => {
    if (disabled || isSubmitted) return;

    // Toggle: if already selected, unselect; otherwise select
    if (selectedAnswer === optionId) {
      onAnswerChange(null);
    } else {
      onAnswerChange(optionId);
    }
  };

  const getOptionState = (option: ChoiceOption) => {
    if (!isSubmitted || !showCorrectAnswer) {
      return selectedAnswer === option.id ? "selected" : "default";
    }

    // After submission with answers shown
    if (option.isCorrect) {
      return "correct";
    }
    if (selectedAnswer === option.id && !option.isCorrect) {
      return "incorrect";
    }
    return "default";
  };

  const isCorrect = isSubmitted && showCorrectAnswer && options.find(o => o.id === selectedAnswer)?.isCorrect;

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-medium text-gray-600">Question {questionNumber}</p>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-semibold text-gray-900 break-words overflow-hidden [word-break:break-word]">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5 sm:space-y-3">
        {options.map((option) => {
          const state = getOptionState(option);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option.id)}
              disabled={disabled || isSubmitted}
              className={cn(
                "w-full text-left px-4 sm:px-5 py-3 sm:py-4 rounded-full border transition-all text-xs sm:text-sm",
                "focus:outline-none",
                state === "default" && "border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
                state === "selected" && "border-[#F04F54] bg-[#F04F54] text-white",
                state === "correct" && "border-green-500 bg-green-500 text-white",
                state === "incorrect" && "border-red-500 bg-red-500 text-white",
                (disabled || isSubmitted) && state === "default" && "cursor-not-allowed opacity-60"
              )}
            >
              <RichContentRenderer content={option.content} />
            </button>
          );
        })}
      </div>

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && selectedAnswer && (
        <div className={cn(
          "flex items-center justify-between py-3 px-4 rounded-lg",
          isCorrect ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className={cn(
              "font-medium",
              isCorrect ? "text-green-700" : "text-red-700"
            )}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {isCorrect && (
            <span className="text-green-600 font-medium">+40XP</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {options.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No options available for this question.
        </div>
      )}
    </div>
  );
}
