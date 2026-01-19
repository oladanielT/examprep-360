import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question } from "@/api/types/exam.types";

interface FillInBlankQuestionProps {
  question: Question;
  questionNumber: number;
  answers: Record<string, string>; // { blankId: answer }
  onAnswerChange: (answers: Record<string, string>) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function FillInBlankQuestion({
  question,
  questionNumber,
  answers,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: FillInBlankQuestionProps) {
  const fillData = question.fillInBlankData;

  if (!fillData) {
    return (
      <div className="text-center py-8 text-gray-500">
        Fill in the blank data not available.
      </div>
    );
  }

  const handleInputChange = (blankId: string, value: string) => {
    if (disabled || isSubmitted) return;
    onAnswerChange({ ...answers, [blankId]: value });
  };

  const isAnswerCorrect = (blankId: string, userAnswer: string) => {
    const blank = fillData.blanks.find((b) => b.id === blankId);
    if (!blank || !userAnswer) return false;

    return blank.acceptableAnswers.some(
      (acceptable) => acceptable.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    );
  };

  // Check if all blanks are correct
  const allCorrect = fillData.blanks.every((blank) =>
    isAnswerCorrect(blank.id, answers[blank.id] || "")
  );

  // Parse template and replace [[id]] with input fields
  const renderTemplate = () => {
    const parts = fillData.template.split(/(\[\[\d+\]\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[\[(\d+)\]\]/);
      if (match) {
        const blankId = match[1];
        const blank = fillData.blanks.find((b) => b.id === blankId);
        const userAnswer = answers[blankId] || "";
        const isCorrect = isAnswerCorrect(blankId, userAnswer);

        return (
          <span key={index} className="inline-flex items-center mx-1 my-1">
            <input
              type={blank?.inputType === "number" ? "number" : "text"}
              value={userAnswer}
              onChange={(e) => handleInputChange(blankId, e.target.value)}
              disabled={disabled || isSubmitted}
              placeholder={blank?.hint || "..."}
              className={cn(
                "w-32 px-3 py-2 border-2 rounded-full text-center text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#F04F54]/50",
                !isSubmitted && "border-gray-300 focus:border-[#F04F54]",
                isSubmitted && showCorrectAnswer && isCorrect && "border-green-500 bg-green-50 text-green-700",
                isSubmitted && showCorrectAnswer && !isCorrect && userAnswer && "border-red-500 bg-red-50 text-red-700",
                isSubmitted && showCorrectAnswer && !userAnswer && "border-gray-300 bg-gray-50",
                (disabled || isSubmitted) && "cursor-not-allowed"
              )}
            />
            {isSubmitted && showCorrectAnswer && userAnswer && (
              <span className="ml-1">
                {isCorrect ? (
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle weight="fill" className="w-5 h-5 text-red-500" />
                )}
              </span>
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

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

      {/* Fill in the blank template */}
      <div className="text-base leading-relaxed p-4 bg-gray-50 rounded-lg flex flex-wrap items-center">
        {renderTemplate()}
      </div>

      {/* Show correct answers after submission */}
      {isSubmitted && showCorrectAnswer && (
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wide mb-2 opacity-80">Correct Answers</p>
          <ul className="space-y-1 text-sm">
            {fillData.blanks.map((blank) => (
              <li key={blank.id}>
                Blank {blank.id}: {blank.acceptableAnswers.join(" or ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && Object.keys(answers).length > 0 && (
        <div className={cn(
          "flex items-center justify-between py-3 px-4 rounded-lg",
          allCorrect ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className={cn(
              "font-medium",
              allCorrect ? "text-green-700" : "text-red-700"
            )}>
              {allCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>
          {allCorrect && (
            <span className="text-green-600 font-medium">+40XP</span>
          )}
        </div>
      )}
    </div>
  );
}
