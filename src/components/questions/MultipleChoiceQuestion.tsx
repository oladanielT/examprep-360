import { cn } from "@/lib/utils";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question, ChoiceOption } from "@/api/types/exam.types";

interface MultipleChoiceQuestionProps {
  question: Question;
  questionNumber: number;
  selectedAnswers: string[];
  onAnswerChange: (answers: string[]) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: MultipleChoiceQuestionProps) {
  const options = question.options || [];

  const handleOptionClick = (optionId: string) => {
    if (disabled || isSubmitted) return;

    // Toggle: add or remove from selection
    if (selectedAnswers.includes(optionId)) {
      onAnswerChange(selectedAnswers.filter((id) => id !== optionId));
    } else {
      onAnswerChange([...selectedAnswers, optionId]);
    }
  };

  const getOptionState = (option: ChoiceOption) => {
    const isSelected = selectedAnswers.includes(option.id);

    if (!isSubmitted || !showCorrectAnswer) {
      return isSelected ? "selected" : "default";
    }

    // After submission with answers shown
    if (option.isCorrect && isSelected) {
      return "correct";
    }
    if (option.isCorrect && !isSelected) {
      return "missed"; // Should have selected but didn't
    }
    if (!option.isCorrect && isSelected) {
      return "incorrect";
    }
    return "default";
  };

  // Check if all correct answers were selected and no incorrect ones
  const correctOptions = options.filter(o => o.isCorrect);
  const selectedCorrect = selectedAnswers.filter(id => options.find(o => o.id === id)?.isCorrect);
  const selectedIncorrect = selectedAnswers.filter(id => !options.find(o => o.id === id)?.isCorrect);
  const isFullyCorrect = selectedCorrect.length === correctOptions.length && selectedIncorrect.length === 0;

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-600">Question {questionNumber}</p>

        {/* Question Text */}
        <div className="text-lg font-semibold text-gray-900">
          <RichContentRenderer content={question.questionText} />
        </div>

        {/* Instruction for multiple choice */}
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Select all that apply
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const state = getOptionState(option);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option.id)}
              disabled={disabled || isSubmitted}
              className={cn(
                "w-full text-left px-5 py-4 rounded-full border transition-all text-sm",
                "focus:outline-none",
                state === "default" && "border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
                state === "selected" && "border-[#F04F54] bg-[#F04F54] text-white",
                state === "correct" && "border-green-500 bg-green-500 text-white",
                state === "incorrect" && "border-red-500 bg-red-500 text-white",
                state === "missed" && "border-yellow-500 bg-yellow-100 text-yellow-800",
                (disabled || isSubmitted) && state === "default" && "cursor-not-allowed opacity-60"
              )}
            >
              <RichContentRenderer content={option.content} />
            </button>
          );
        })}
      </div>

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && selectedAnswers.length > 0 && (
        <div className={cn(
          "flex items-center justify-between py-3 px-4 rounded-lg",
          isFullyCorrect ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className={cn(
              "font-medium",
              isFullyCorrect ? "text-green-700" : "text-red-700"
            )}>
              {isFullyCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {isFullyCorrect && (
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
