import { cn, XP_PER_CORRECT_ANSWER } from "@/lib/utils";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question, RichContentBlock } from "@/api/types/exam.types";

interface MatchingQuestionProps {
  question: Question;
  questionNumber: number;
  answers: Record<string, string>; // { leftIndex: rightIndex }
  onAnswerChange: (answers: Record<string, string>) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

function richContentToText(blocks: RichContentBlock[]): string {
  return blocks
    .map((b) => ("value" in b ? b.value : "content" in b ? b.content : ""))
    .join("");
}

export function MatchingQuestion({
  question,
  questionNumber,
  answers,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: MatchingQuestionProps) {
  const matchData = question.matchingData;

  if (!matchData) {
    return (
      <div className="text-center py-8 text-gray-500">
        Matching data not available.
      </div>
    );
  }

  // Support both API formats: pairs[] or leftColumn[]/rightColumn[]
  const pairs = matchData.pairs;
  const leftItems = pairs
    ? pairs.map((p, i) => ({ id: String(i), content: p.left }))
    : (matchData.leftColumn || []).map((item) => ({ id: item.id, content: [{ type: "text" as const, value: item.text }] as RichContentBlock[] }));

  const rightItems = pairs
    ? pairs.map((p, i) => ({ id: String(i), content: p.right }))
    : (matchData.rightColumn || []).map((item) => ({ id: item.id, content: [{ type: "text" as const, value: item.text }] as RichContentBlock[] }));

  // For pairs format: correct match is same index (left[0] matches right[0])
  const isMatchCorrect = (leftId: string, selectedRightId: string) => {
    if (pairs) {
      return leftId === selectedRightId;
    }
    // For leftColumn/rightColumn format with correctMatches
    if (matchData.correctMatches) {
      return matchData.correctMatches.includes(`${leftId}-${selectedRightId}`);
    }
    return false;
  };

  const allCorrect = leftItems.every((item) => {
    const selected = answers[item.id];
    return selected !== undefined && isMatchCorrect(item.id, selected);
  });

  const handleSelect = (leftId: string, rightId: string) => {
    if (disabled || isSubmitted) return;
    onAnswerChange({ ...answers, [leftId]: rightId });
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-medium text-gray-600">Question {questionNumber}</p>
        <div className="text-base sm:text-lg font-semibold text-gray-900 break-words overflow-hidden [word-break:break-word]">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* Matching pairs */}
      <div className="space-y-3">
        {leftItems.map((leftItem) => {
          const selectedRight = answers[leftItem.id];
          const correct = isSubmitted && showCorrectAnswer && selectedRight !== undefined && isMatchCorrect(leftItem.id, selectedRight);
          const wrong = isSubmitted && showCorrectAnswer && selectedRight !== undefined && !isMatchCorrect(leftItem.id, selectedRight);

          return (
            <div
              key={leftItem.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border-2 transition-colors",
                !isSubmitted && "border-gray-200",
                correct && "border-green-500 bg-green-50",
                wrong && "border-red-300 bg-red-50"
              )}
            >
              {/* Left item */}
              <div className="flex-1 text-sm font-medium text-gray-900 min-w-0">
                <RichContentRenderer content={leftItem.content} />
              </div>

              {/* Arrow */}
              <span className="text-gray-400 hidden sm:block">&rarr;</span>

              {/* Dropdown */}
              <select
                value={selectedRight || ""}
                onChange={(e) => handleSelect(leftItem.id, e.target.value)}
                disabled={disabled || isSubmitted}
                className={cn(
                  "flex-1 px-3 py-2 border rounded-lg text-sm bg-white transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-[#F04F54]/50 focus:border-[#F04F54]",
                  (disabled || isSubmitted) && "cursor-not-allowed bg-gray-50"
                )}
              >
                <option value="">Select a match...</option>
                {rightItems.map((rightItem) => (
                  <option key={rightItem.id} value={rightItem.id}>
                    {richContentToText(rightItem.content)}
                  </option>
                ))}
              </select>

              {/* Result icon */}
              {isSubmitted && showCorrectAnswer && selectedRight !== undefined && (
                correct ? (
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle weight="fill" className="w-5 h-5 text-red-500 flex-shrink-0" />
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Show correct matches after submission */}
      {isSubmitted && showCorrectAnswer && !allCorrect && (
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wide mb-2 opacity-80">Correct Matches</p>
          <div className="space-y-1 text-sm">
            {pairs ? (
              pairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{richContentToText(pair.left)}</span>
                  <span className="opacity-60">&rarr;</span>
                  <span>{richContentToText(pair.right)}</span>
                </div>
              ))
            ) : (
              matchData.correctMatches?.map((match) => (
                <div key={match}>{match}</div>
              ))
            )}
          </div>
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
            <span className="text-green-600 font-medium">+{XP_PER_CORRECT_ANSWER}XP</span>
          )}
        </div>
      )}
    </div>
  );
}
