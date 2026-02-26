import { cn, XP_PER_CORRECT_ANSWER } from "@/lib/utils";
import { ArrowUp, ArrowDown, CheckCircle, XCircle } from "@phosphor-icons/react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question } from "@/api/types/exam.types";
import { useEffect } from "react";

interface OrderingQuestionProps {
  question: Question;
  questionNumber: number;
  answer: string[]; // ordered item IDs
  onAnswerChange: (answer: string[]) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function OrderingQuestion({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: OrderingQuestionProps) {
  const orderData = question.orderingData;
  const items = orderData?.items || [];
  // correctOrder from API, or fall back to item IDs in their original order (the API returns items in correct order)
  const correctOrder = orderData?.correctOrder || items.map((item) => item.id);

  // Initialize answer with shuffled order if empty
  useEffect(() => {
    if (answer.length === 0 && items.length > 0) {
      // Shuffle items so the student doesn't start with the correct order
      const ids = items.map((item) => item.id);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      // If shuffle resulted in the correct order, swap first two
      if (ids.length > 1 && ids.every((id, idx) => id === correctOrder[idx])) {
        [ids[0], ids[1]] = [ids[1], ids[0]];
      }
      onAnswerChange(ids);
    }
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const getItemById = (id: string) => items.find((item) => item.id === id);

  const getItemText = (item: typeof items[0]) => {
    if (item.content) return <RichContentRenderer content={item.content} />;
    if (item.text) return <span>{item.text}</span>;
    return <span>Item {item.id}</span>;
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (disabled || isSubmitted) return;
    const newOrder = [...answer];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    onAnswerChange(newOrder);
  };

  const isCorrect = correctOrder
    ? answer.length === correctOrder.length && answer.every((id, i) => id === correctOrder[i])
    : false;

  const isItemCorrect = (id: string, index: number) => {
    if (!correctOrder) return false;
    return correctOrder[index] === id;
  };

  if (!orderData || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Ordering data not available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-medium text-gray-600">Question {questionNumber}</p>
        <div className="text-base sm:text-lg font-semibold text-gray-900 break-words overflow-hidden [word-break:break-word]">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* Ordering items */}
      <div className="space-y-2">
        {answer.map((itemId, index) => {
          const item = getItemById(itemId);
          if (!item) return null;

          const itemCorrect = isSubmitted && showCorrectAnswer && isItemCorrect(itemId, index);
          const itemWrong = isSubmitted && showCorrectAnswer && !isItemCorrect(itemId, index);

          return (
            <div
              key={itemId}
              className={cn(
                "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 transition-colors",
                !isSubmitted && "border-gray-200 bg-white",
                itemCorrect && "border-green-500 bg-green-50",
                itemWrong && "border-red-300 bg-red-50"
              )}
            >
              {/* Position number */}
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                !isSubmitted && "bg-gray-100 text-gray-500",
                itemCorrect && "bg-green-500 text-white",
                itemWrong && "bg-red-400 text-white"
              )}>
                {index + 1}
              </span>

              {/* Item text */}
              <div className="flex-1 text-sm text-gray-900 min-w-0">
                {getItemText(item)}
              </div>

              {/* Move buttons */}
              {!isSubmitted && !disabled && (
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === answer.length - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Result icon */}
              {isSubmitted && showCorrectAnswer && (
                itemCorrect ? (
                  <CheckCircle weight="fill" className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle weight="fill" className="w-5 h-5 text-red-500 flex-shrink-0" />
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Show correct order after submission */}
      {isSubmitted && showCorrectAnswer && !isCorrect && correctOrder && (
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wide mb-2 opacity-80">Correct Order</p>
          <ol className="space-y-1 text-sm list-decimal list-inside">
            {correctOrder.map((id) => {
              const item = getItemById(id);
              if (!item) return null;
              return (
                <li key={id}>
                  {item.content
                    ? item.content.map((b) => ("value" in b ? b.value : "content" in b ? b.content : "")).join("")
                    : item.text || `Item ${id}`}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && answer.length > 0 && (
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
            <span className="text-green-600 font-medium">+{XP_PER_CORRECT_ANSWER}XP</span>
          )}
        </div>
      )}
    </div>
  );
}
