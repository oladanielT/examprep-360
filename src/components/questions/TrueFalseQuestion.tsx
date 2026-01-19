import { cn } from "@/lib/utils";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question } from "@/api/types/exam.types";

interface TrueFalseQuestionProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: boolean | null;
  onAnswerChange: (answer: boolean | null) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function TrueFalseQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: TrueFalseQuestionProps) {
  const correctAnswer = question.trueFalseData?.correctAnswer;

  const handleOptionClick = (value: boolean) => {
    if (disabled || isSubmitted) return;

    // Toggle: if already selected, unselect; otherwise select
    if (selectedAnswer === value) {
      onAnswerChange(null);
    } else {
      onAnswerChange(value);
    }
  };

  const getOptionState = (value: boolean) => {
    if (!isSubmitted || !showCorrectAnswer) {
      return selectedAnswer === value ? "selected" : "default";
    }

    // After submission with answers shown
    if (correctAnswer === value) {
      return selectedAnswer === value ? "correct" : "missed";
    }
    if (selectedAnswer === value && correctAnswer !== value) {
      return "incorrect";
    }
    return "default";
  };

  const isCorrect = isSubmitted && showCorrectAnswer && selectedAnswer === correctAnswer;

  const options = [
    { value: true, label: "True" },
    { value: false, label: "False" },
  ];

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-600">Question {questionNumber}</p>

        {/* Question Text */}
        <div className="text-lg font-semibold text-gray-900">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* True/False Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const state = getOptionState(option.value);

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              disabled={disabled || isSubmitted}
              className={cn(
                "w-full text-center px-5 py-4 rounded-full border transition-all text-sm font-medium",
                "focus:outline-none",
                state === "default" && "border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
                state === "selected" && "border-[#F04F54] bg-[#F04F54] text-white",
                state === "correct" && "border-green-500 bg-green-500 text-white",
                state === "incorrect" && "border-red-500 bg-red-500 text-white",
                state === "missed" && "border-yellow-500 bg-yellow-100 text-yellow-800",
                (disabled || isSubmitted) && state === "default" && "cursor-not-allowed opacity-60"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && selectedAnswer !== null && (
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
    </div>
  );
}
