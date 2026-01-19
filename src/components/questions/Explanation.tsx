import { RichContentRenderer } from "./RichContentRenderer";
import type { ExplanationData } from "@/api/types/exam.types";

interface ExplanationProps {
  explanation: ExplanationData;
}

export function Explanation({ explanation }: ExplanationProps) {
  return (
    <div className="mt-6 space-y-6 border-t pt-6">
      {/* Solution */}
      {explanation.solution && explanation.solution.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Explanation</h3>
          <div className="prose prose-sm max-w-none">
            <RichContentRenderer content={explanation.solution} />
          </div>
        </div>
      )}

      {/* Working Steps */}
      {explanation.workingSteps && explanation.workingSteps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Working Steps</h3>
          <div className="space-y-3">
            {explanation.workingSteps.map((step, index) => (
              <div key={index} className="pl-4 border-l-2 border-blue-200">
                <p className="text-sm font-medium text-blue-700">Step {index + 1}</p>
                <p className="text-sm text-gray-700 mt-1">{step.step}</p>
                {step.formula && (
                  <code className="block mt-2 px-3 py-2 bg-gray-100 rounded text-sm">
                    {step.formula}
                  </code>
                )}
                {step.explanation && (
                  <p className="text-sm text-gray-600 mt-1 italic">{step.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Points */}
      {explanation.keyPoints && explanation.keyPoints.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Key Points</h3>
          <ul className="space-y-2">
            {explanation.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-1">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Common Mistakes</h3>
          <ul className="space-y-2">
            {explanation.commonMistakes.map((mistake, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-red-500 mt-1">✗</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {explanation.tips && explanation.tips.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Tips</h3>
          <ul className="space-y-2">
            {explanation.tips.map((tip, index) => (
              <li key={index} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-1">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
