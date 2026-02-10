import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import type {
  RichContentBlock,
  TextBlock,
  MarkdownBlock,
  LatexBlock,
  ImageBlock,
  AudioBlock,
  VideoBlock,
  TableBlock,
  DiagramBlock,
  ListBlock,
} from "@/api/types/exam.types";

interface RichContentRendererProps {
  content: RichContentBlock[];
  className?: string;
}

// Render LaTeX string to HTML using KaTeX
function renderLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      trust: true,
      strict: false,
    });
  } catch {
    return latex; // Return raw string if KaTeX fails
  }
}

// Parse text containing $...$ (inline) and $$...$$ (display) LaTeX patterns
function parseTextWithLatex(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match $$...$$ (display mode) or $...$ (inline mode)
  const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;

  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    const matchedText = match[0];
    const isDisplayMode = matchedText.startsWith("$$");
    const latex = isDisplayMode
      ? matchedText.slice(2, -2) // Remove $$ from both ends
      : matchedText.slice(1, -1); // Remove $ from both ends

    nodes.push(
      <span
        key={key++}
        className={isDisplayMode ? "block my-2" : "inline"}
        dangerouslySetInnerHTML={{ __html: renderLatex(latex, isDisplayMode) }}
      />
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return nodes.length > 0 ? nodes : [<span key={0}>{text}</span>];
}

function TextBlockRenderer({ block }: { block: TextBlock }) {
  const style = block.style;

  // Check if text contains LaTeX patterns
  const value = block.value ?? "";
  const hasLatex = value.includes("$");
  const hasNewlines = value.includes("\n");

  const content = useMemo(() => {
    if (hasLatex) {
      const nodes = parseTextWithLatex(value);
      if (!hasNewlines) return nodes;
      // Insert <br /> for newlines within LaTeX-parsed nodes
      const result: React.ReactNode[] = [];
      let brKey = 1000;
      for (const node of nodes) {
        if (typeof node === "string") {
          const parts = node.split("\n");
          parts.forEach((part, i) => {
            if (i > 0) result.push(<br key={brKey++} />);
            if (part) result.push(part);
          });
        } else {
          result.push(node);
        }
      }
      return result;
    }
    if (hasNewlines) {
      const parts = value.split("\n");
      const result: React.ReactNode[] = [];
      parts.forEach((part, i) => {
        if (i > 0) result.push(<br key={`br-${i}`} />);
        if (part) result.push(<span key={`t-${i}`}>{part}</span>);
      });
      return result;
    }
    return value;
  }, [value, hasLatex, hasNewlines]);

  // Use <p> for block-level text (adds margin between consecutive text blocks)
  return (
    <p
      className={cn(
        "mb-2 last:mb-0",
        style?.bold && "font-bold",
        style?.italic && "italic",
        style?.underline && "underline",
        style?.fontSize === "small" && "text-sm",
        style?.fontSize === "large" && "text-lg"
      )}
      style={{ color: style?.color }}
    >
      {content}
    </p>
  );
}

function MarkdownBlockRenderer({ block }: { block: MarkdownBlock }) {
  // Handle case where content might be a JSON string (legacy format)
  let blockContent = block.content ?? "";

  // Try to parse JSON if it looks like JSON
  if (blockContent.startsWith("{") && blockContent.includes('"content"')) {
    try {
      const parsed = JSON.parse(blockContent);
      blockContent = parsed.content || blockContent;
    } catch {
      // Not valid JSON, use as-is
    }
  }

  const hasLatex = blockContent.includes("$");
  const hasNewlines = blockContent.includes("\n");

  const content = useMemo(() => {
    if (hasLatex) {
      const nodes = parseTextWithLatex(blockContent);
      if (!hasNewlines) return nodes;
      // Handle newlines within LaTeX-parsed content
      const result: React.ReactNode[] = [];
      let brKey = 2000;
      for (const node of nodes) {
        if (typeof node === "string") {
          const parts = node.split("\n");
          parts.forEach((part, i) => {
            if (i > 0) result.push(<br key={brKey++} />);
            if (part) result.push(part);
          });
        } else {
          result.push(node);
        }
      }
      return result;
    }
    if (hasNewlines) {
      const parts = blockContent.split("\n");
      const result: React.ReactNode[] = [];
      parts.forEach((part, i) => {
        if (i > 0) result.push(<br key={`mbr-${i}`} />);
        if (part) result.push(<span key={`mt-${i}`}>{part}</span>);
      });
      return result;
    }
    return blockContent;
  }, [blockContent, hasLatex, hasNewlines]);

  return <div className="prose prose-sm max-w-none mb-2 last:mb-0">{content}</div>;
}

function parseLatexValue(value: string): { equation: string; displayMode: boolean } {
  // Try JSON parse first (legacy format: '{"equation":"x^2","displayMode":false}')
  try {
    const parsed = JSON.parse(value);
    if (parsed.equation) {
      return { equation: parsed.equation, displayMode: parsed.displayMode ?? false };
    }
  } catch {
    // Not JSON, treat as raw equation
  }

  // Check for display mode markers $$...$$
  if (value.startsWith("$$") && value.endsWith("$$")) {
    return { equation: value.slice(2, -2), displayMode: true };
  }

  return { equation: value, displayMode: false };
}

function LatexBlockRenderer({ block }: { block: LatexBlock }) {
  const { equation, displayMode } = useMemo(() => parseLatexValue(block.value), [block.value]);

  const html = useMemo(() => renderLatex(equation, displayMode), [equation, displayMode]);

  return (
    <span
      className={displayMode ? "block my-2 text-center" : "inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  let src = block.url;
  let alt = block.alt || "Question image";

  // Handle API shape where image data arrives as a JSON string in `value`
  // e.g. { type: "image", value: '{"src":"https://...","alt":null,"title":null}' }
  if (!src) {
    const rawValue = (block as unknown as { value?: string }).value;
    if (rawValue) {
      try {
        const parsed = JSON.parse(rawValue);
        src = parsed.src || parsed.url || rawValue;
        alt = parsed.alt || alt;
      } catch {
        // value is not JSON — use it as a raw URL
        src = rawValue;
      }
    }
  }

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-2"
    />
  );
}

function AudioBlockRenderer({ block }: { block: AudioBlock }) {
  return (
    <audio controls className="w-full my-2">
      <source src={block.url ?? ""} />
      Your browser does not support the audio element.
    </audio>
  );
}

function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  // Check if it's a YouTube link
  const url = block.url ?? "";
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  if (isYouTube) {
    // Extract video ID and create embed URL
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    }

    return (
      <div className="aspect-video my-2">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full rounded-lg"
          allowFullScreen
          title="Video content"
        />
      </div>
    );
  }

  return (
    <video controls className="w-full rounded-lg my-2">
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

function TableBlockRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            {block.headers.map((header, idx) => (
              <th
                key={idx}
                className="border border-gray-200 px-4 py-2 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="even:bg-gray-50">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="border border-gray-200 px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiagramBlockRenderer({ block }: { block: DiagramBlock }) {
  return (
    <div className="relative my-2">
      <img
        src={block.imageUrl}
        alt="Diagram"
        className="max-w-full h-auto rounded-lg"
      />
      {block.annotations?.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute bg-[#F04F54] text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
        >
          {annotation.label}
        </div>
      ))}
    </div>
  );
}

function ListBlockRenderer({ block }: { block: ListBlock }) {
  return (
    <ul className="list-disc list-inside my-2 space-y-1">
      {block.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

function renderBlock(block: RichContentBlock, index: number) {
  switch (block.type) {
    case "text":
      return <TextBlockRenderer key={index} block={block} />;
    case "markdown":
      return <MarkdownBlockRenderer key={index} block={block} />;
    case "latex":
      return <LatexBlockRenderer key={index} block={block} />;
    case "image":
      return <ImageBlockRenderer key={index} block={block} />;
    case "audio":
      return <AudioBlockRenderer key={index} block={block} />;
    case "video":
      return <VideoBlockRenderer key={index} block={block} />;
    case "table":
      return <TableBlockRenderer key={index} block={block} />;
    case "diagram":
      return <DiagramBlockRenderer key={index} block={block} />;
    case "list":
      return <ListBlockRenderer key={index} block={block} />;
    default:
      // Fallback for unknown types - try to render value or content
      const unknownBlock = block as { value?: string; content?: string; text?: string };
      const fallbackText = unknownBlock.value || unknownBlock.content || unknownBlock.text || "";
      // Check if fallback text has LaTeX
      if (fallbackText.includes("$")) {
        return <span key={index}>{parseTextWithLatex(fallbackText)}</span>;
      }
      return <span key={index}>{fallbackText}</span>;
  }
}

export const RichContentRenderer = memo(function RichContentRenderer({ content, className }: RichContentRendererProps) {
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className={cn("rich-content break-words [word-break:break-word] overflow-hidden", className)}>
      {content.map((block, index) => renderBlock(block, index))}
    </div>
  );
});

// Helper to extract plain text from rich content (for accessibility, search, etc.)
export function getPlainText(content: RichContentBlock[]): string {
  if (!content) return "";

  return content
    .map((block) => {
      switch (block.type) {
        case "text":
          return block.value;
        case "markdown":
          return block.content;
        case "latex":
          return typeof block.value === "string" ? block.value : (block.value as { equation?: string })?.equation || "";
        case "list":
          return block.items.join(", ");
        case "table":
          return [...block.headers, ...block.rows.flat()].join(" ");
        default:
          return "";
      }
    })
    .join(" ");
}
