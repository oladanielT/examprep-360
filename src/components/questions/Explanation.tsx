import { useMemo } from "react";
import { RichContentRenderer } from "./RichContentRenderer";
import type { ExplanationData, RichContentBlock } from "@/api/types/exam.types";

interface ExplanationProps {
  explanation: ExplanationData;
}

// Section types for parsed explanation content
interface ParsedSection {
  type:
    | "main"
    | "why-incorrect"
    | "key-terms"
    | "example"
    | "references"
    | "common-mistakes"
    | "tips"
    | "generic";
  title: string;
  body: string;
}

// Patterns that mark the start of a new section in the solution text.
// Order matters: first match wins, so more specific patterns come first.
const SECTION_PATTERNS: { pattern: RegExp; type: ParsedSection["type"]; title: string }[] = [
  {
    pattern: /\*\*\s*Why\s+other\s+options?\s+(?:are\s+)?incorrect\s*\*\*/i,
    type: "why-incorrect",
    title: "Why Other Options Are Incorrect",
  },
  {
    pattern: /\*\*\s*Why\s+others?\s+(?:are\s+)?wrong\s*\*\*/i,
    type: "why-incorrect",
    title: "Why Other Options Are Incorrect",
  },
  {
    pattern: /\*\*\s*Key\s+Terms?\s*\*\*/i,
    type: "key-terms",
    title: "Key Terms",
  },
  {
    pattern: /\*\*\s*Key\s+Concepts?\s*\*\*/i,
    type: "key-terms",
    title: "Key Concepts",
  },
  {
    pattern: /\*\*\s*Relatable\s+Example\s*\*\*/i,
    type: "example",
    title: "Relatable Example",
  },
  {
    pattern: /\*\*\s*Real[- ]?world\s+Example\s*\*\*/i,
    type: "example",
    title: "Real-World Example",
  },
  {
    pattern: /\*\*\s*References?\s*\*\*/i,
    type: "references",
    title: "References",
  },
  {
    pattern: /\*\*\s*Common\s+Mistakes?\s*\*\*/i,
    type: "common-mistakes",
    title: "Common Mistakes",
  },
  {
    pattern: /\*\*\s*Tips?\s*\*\*/i,
    type: "tips",
    title: "Tips",
  },
];

/**
 * Extract the full plain text from solution blocks, preserving newlines.
 */
function extractSolutionText(solution: RichContentBlock[]): string {
  return solution
    .map((block) => {
      if (block.type === "text") return block.value;
      if (block.type === "markdown") return block.content;
      return "";
    })
    .join("\n");
}

/**
 * Split the solution text into sections based on bold markers like **Key Terms**.
 * Returns an array of ParsedSection objects.
 */
function parseSolutionIntoSections(text: string): ParsedSection[] {
  // Build a combined regex to find all section markers
  const allPatterns = SECTION_PATTERNS.map((s) => `(${s.pattern.source})`).join("|");
  const combinedRegex = new RegExp(allPatterns, "gi");

  const matches: { index: number; length: number; type: ParsedSection["type"]; title: string }[] =
    [];
  let m: RegExpExecArray | null;

  while ((m = combinedRegex.exec(text)) !== null) {
    // Determine which pattern matched by checking which capture group is defined
    let matchedIdx = -1;
    for (let i = 1; i <= SECTION_PATTERNS.length; i++) {
      if (m[i] !== undefined) {
        matchedIdx = i - 1;
        break;
      }
    }
    if (matchedIdx >= 0) {
      matches.push({
        index: m.index,
        length: m[0].length,
        type: SECTION_PATTERNS[matchedIdx].type,
        title: SECTION_PATTERNS[matchedIdx].title,
      });
    }
  }

  if (matches.length === 0) {
    // No markers found — return everything as main
    return [{ type: "main", title: "Explanation", body: text.trim() }];
  }

  const sections: ParsedSection[] = [];

  // Text before the first marker is the main explanation
  const mainBody = text.slice(0, matches[0].index).trim();
  if (mainBody) {
    sections.push({ type: "main", title: "Explanation", body: mainBody });
  }

  // Each marker starts a section that runs until the next marker
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end).trim();
    sections.push({
      type: matches[i].type,
      title: matches[i].title,
      body,
    });
  }

  return sections;
}

/**
 * Convert a plain-text body into RichContentBlock[] so it can be rendered
 * with the existing RichContentRenderer.
 */
function bodyToBlocks(body: string): RichContentBlock[] {
  return [{ type: "text" as const, value: body, style: {} }];
}

/**
 * Render a parsed section with appropriate styling.
 */
function SectionRenderer({ section }: { section: ParsedSection }) {
  switch (section.type) {
    case "main":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="prose prose-sm max-w-none">
            <RichContentRenderer content={bodyToBlocks(section.body)} />
          </div>
        </div>
      );

    case "why-incorrect":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    case "key-terms":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    case "example":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border-l-4 border-green-400 bg-green-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    case "references":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-600">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    case "common-mistakes":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    case "tips":
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="prose prose-sm max-w-none text-gray-700">
              <RichContentRenderer content={bodyToBlocks(section.body)} />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <div className="prose prose-sm max-w-none">
            <RichContentRenderer content={bodyToBlocks(section.body)} />
          </div>
        </div>
      );
  }
}

export function Explanation({ explanation }: ExplanationProps) {
  const hasStructuredData =
    (explanation.workingSteps && explanation.workingSteps.length > 0) ||
    (explanation.keyPoints && explanation.keyPoints.length > 0) ||
    (explanation.commonMistakes && explanation.commonMistakes.length > 0) ||
    (explanation.tips && explanation.tips.length > 0);

  // Parse sections from solution text when no structured data is present
  const parsedSections = useMemo(() => {
    if (hasStructuredData) return null;
    if (!explanation.solution || explanation.solution.length === 0) return null;

    const text = extractSolutionText(explanation.solution);
    if (!text.trim()) return null;

    const sections = parseSolutionIntoSections(text);
    // Only use parsed sections if we actually found markers (more than just "main")
    if (sections.length <= 1) return null;
    return sections;
  }, [explanation.solution, hasStructuredData]);

  // If we successfully parsed sections from the solution text, render them
  if (parsedSections) {
    return (
      <div className="mt-6 space-y-6 border-t pt-6">
        {parsedSections.map((section, index) => (
          <SectionRenderer key={index} section={section} />
        ))}
      </div>
    );
  }

  // Otherwise, fall back to the existing behavior
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
