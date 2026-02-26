import { cn, XP_PER_CORRECT_ANSWER } from "@/lib/utils";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { Question } from "@/api/types/exam.types";
import { useEffect, useRef } from "react";
import katex from "katex";
import "mathlive/fonts.css";

interface CalculationQuestionProps {
  question: Question;
  questionNumber: number;
  answer: Record<string, string>; // { working: string (LaTeX), finalAnswer: string }
  onAnswerChange: (answer: Record<string, string>) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
}

export function CalculationQuestion({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  isSubmitted = false,
  disabled = false,
  showCorrectAnswer = false,
}: CalculationQuestionProps) {
  const calcData = question.calculationData;
  const expectedValue = calcData?.expectedAnswer?.value ?? calcData?.finalAnswer;
  const unit = calcData?.expectedAnswer?.unit || "";
  const mathfieldRef = useRef<HTMLElement | null>(null);
  const initialized = useRef(false);

  const working = answer.working || "";
  const finalAnswer = answer.finalAnswer || "";

  const numAnswer = parseFloat(finalAnswer);
  const isCorrect = !isNaN(numAnswer) && expectedValue !== undefined && numAnswer === expectedValue;

  const handleChange = (field: string, value: string) => {
    if (disabled || isSubmitted) return;
    onAnswerChange({ ...answer, [field]: value });
  };

  // Initialize MathLive custom element
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    import("mathlive").then((ml) => {
      if (typeof ml.MathfieldElement !== "undefined") {
        // Ensure the custom element is defined
        ml.MathfieldElement;
      }
    });
  }, []);

  // Set up the mathfield event listener
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;

    const handler = (evt: Event) => {
      const target = evt.target as HTMLElement & { value?: string };
      if (target.value !== undefined) {
        handleChange("working", target.value);
      }
    };

    mf.addEventListener("input", handler);
    return () => mf.removeEventListener("input", handler);
  });

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-medium text-gray-600">Question {questionNumber}</p>
        <div className="text-base sm:text-lg font-semibold text-gray-900 break-words overflow-hidden [word-break:break-word]">
          <RichContentRenderer content={question.questionText} />
        </div>
      </div>

      {/* Math working area */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Show your working</p>
        {isSubmitted || disabled ? (
          // Read-only: render the LaTeX with KaTeX
          <div className={cn(
            "w-full px-4 py-3 border rounded-lg bg-gray-50 min-h-[80px] text-sm",
            "cursor-not-allowed"
          )}>
            {working ? (
              <span dangerouslySetInnerHTML={{
                __html: (() => {
                  try {
                    return katex.renderToString(working, { displayMode: true, throwOnError: false });
                  } catch {
                    return working;
                  }
                })()
              }} />
            ) : (
              <span className="text-gray-400">No working provided</span>
            )}
          </div>
        ) : (
          // Editable math field
          <div className="border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#F04F54]/50 focus-within:border-[#F04F54]">
            {/* @ts-ignore - math-field is a custom element from mathlive */}
            <math-field
              ref={mathfieldRef}
              style={{
                width: "100%",
                minHeight: "100px",
                fontSize: "16px",
                padding: "12px",
                border: "none",
                outline: "none",
                display: "block",
              }}
              virtual-keyboard-mode="manual"
              math-virtual-keyboard-policy="auto"
            >
              {working}
            </math-field>
          </div>
        )}
        <p className="text-[10px] text-gray-400">
          Use the keyboard to type equations. Click the keyboard icon for math symbols.
        </p>
      </div>

      {/* Final answer input */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Final Answer</p>
        <div className="flex items-center gap-2">
          {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
          <input
            type="number"
            value={finalAnswer}
            onChange={(e) => handleChange("finalAnswer", e.target.value)}
            disabled={disabled || isSubmitted}
            placeholder="Enter your final answer..."
            className={cn(
              "flex-1 px-4 py-3 border-2 rounded-xl text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#F04F54]/50 focus:border-[#F04F54]",
              "placeholder:text-gray-400",
              !isSubmitted && "border-gray-200",
              isSubmitted && showCorrectAnswer && isCorrect && finalAnswer && "border-green-500 bg-green-50",
              isSubmitted && showCorrectAnswer && !isCorrect && finalAnswer && "border-red-500 bg-red-50",
              (disabled || isSubmitted) && "cursor-not-allowed"
            )}
          />
        </div>
      </div>

      {/* Formula + correct answer shown AFTER submission only */}
      {isSubmitted && showCorrectAnswer && (
        <>
          {calcData?.formula && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm text-gray-700">
              <span className="font-medium text-blue-600 text-xs uppercase tracking-wide block mb-1">Formula</span>
              {calcData.formula}
            </div>
          )}

          {!isCorrect && expectedValue !== undefined && (
            <div className="bg-green-600 text-white p-3 rounded-lg">
              <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Correct Answer</p>
              <p className="text-sm font-medium">{unit}{expectedValue.toLocaleString()}</p>
            </div>
          )}
        </>
      )}

      {/* Correct/Incorrect Feedback */}
      {isSubmitted && showCorrectAnswer && finalAnswer && (
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
