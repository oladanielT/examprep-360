import { cn } from "@/lib/utils";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question, RichContentBlock } from "@/api/types/exam.types";

interface EssayQuestionProps {
  question: Question;
  questionNumber: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctAnswer?: RichContentBlock[];
}

export function EssayQuestion({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
  correctAnswer,
}: EssayQuestionProps) {
  const essayData = question.essayData;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const minWords = essayData?.minWords || 0;
  const maxWords = essayData?.maxWords || 500;

  const isWithinLimits = wordCount >= minWords && wordCount <= maxWords;

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

      {/* Correct Answer (shown after submission) */}
      {isSubmitted && showCorrectAnswer && correctAnswer && (
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wide mb-2 opacity-80">Correct Answer</p>
          <div className="text-sm">
            <RichContentRenderer content={correctAnswer} />
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Text Input</p>
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled || isSubmitted}
          placeholder="Type your answer here"
          rows={6}
          className={cn(
            "w-full px-4 py-3 border rounded-lg resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#F04F54]/50 focus:border-[#F04F54]",
            "placeholder:text-gray-400",
            disabled || isSubmitted ? "bg-gray-50 cursor-not-allowed" : "bg-white",
            !isWithinLimits && wordCount > 0 && "border-yellow-500"
          )}
        />

        {/* Word count */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {minWords > 0 && `Min: ${minWords} words`}
            {minWords > 0 && maxWords && " | "}
            {maxWords && `Max: ${maxWords} words`}
          </span>
          <span className={cn(
            wordCount > maxWords && "text-red-500",
            wordCount < minWords && wordCount > 0 && "text-yellow-600"
          )}>
            {wordCount} words
          </span>
        </div>
      </div>

      {/* Expected Points (hints) */}
      {!isSubmitted && essayData?.expectedPoints && essayData.expectedPoints.length > 0 && (
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">Points to cover:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            {essayData.expectedPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rubric (after submission) */}
      {isSubmitted && showCorrectAnswer && essayData?.rubric && essayData.rubric.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-sm mb-2">Marking Rubric:</p>
          <div className="space-y-1">
            {essayData.rubric.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.criterion}</span>
                <span className="text-gray-500">{item.maxMarks} marks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && showCorrectAnswer && answer && (
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="font-medium text-blue-700">Answer submitted</span>
          </div>
        </div>
      )}
    </div>
  );
}
