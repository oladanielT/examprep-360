import { cn, XP_PER_CORRECT_ANSWER } from "@/lib/utils";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question } from "@/api/types/exam.types";

interface ShortAnswerQuestionProps {
  question: Question;
  questionNumber: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function ShortAnswerQuestion({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: ShortAnswerQuestionProps) {
  const shortData = question.shortAnswerData;
  const acceptedAnswers = shortData?.acceptedAnswers || shortData?.acceptableAnswers || [];
  const caseSensitive = shortData?.caseSensitive ?? false;

  const isCorrect = acceptedAnswers.some((accepted) =>
    caseSensitive
      ? accepted.trim() === answer.trim()
      : accepted.toLowerCase().trim() === answer.toLowerCase().trim()
  );

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-medium text-gray-600">Question {questionNumber}</p>
        <div className="text-base sm:text-lg font-semibold text-gray-900 break-words overflow-hidden [word-break:break-word]">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => {
            if (!disabled && !isSubmitted) onAnswerChange(e.target.value);
          }}
          disabled={disabled || isSubmitted}
          placeholder="Type your answer..."
          className={cn(
            "w-full px-4 py-3 border-2 rounded-xl text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#F04F54]/50 focus:border-[#F04F54]",
            "placeholder:text-gray-400",
            !isSubmitted && "border-gray-200",
            isSubmitted && showCorrectAnswer && isCorrect && answer && "border-green-500 bg-green-50",
            isSubmitted && showCorrectAnswer && !isCorrect && answer && "border-red-500 bg-red-50",
            (disabled || isSubmitted) && "cursor-not-allowed"
          )}
        />

        {/* Show correct answer after submission */}
        {isSubmitted && showCorrectAnswer && !isCorrect && acceptedAnswers.length > 0 && (
          <div className="bg-green-600 text-white p-3 rounded-lg">
            <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Correct Answer</p>
            <p className="text-sm font-medium">{acceptedAnswers.join(" / ")}</p>
          </div>
        )}
      </div>

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && answer && (
        <div className={cn(
          "flex items-center justify-between py-3 px-4 rounded-lg",
          isCorrect ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle weight="fill" className="w-5 h-5 text-red-500" />
            )}
            <span className={cn(
              "font-medium",
              isCorrect ? "text-green-700" : "text-red-700"
            )}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {isCorrect && (
            <span className="text-green-600 font-medium">+{XP_PER_CORRECT_ANSWER}XP</span>
          )}
        </div>
      )}
    </div>
  );
}
