import { memo } from "react";
import { cn } from "@/lib/utils";
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

function TextBlockRenderer({ block }: { block: TextBlock }) {
  const style = block.style;
  return (
    <span
      className={cn(
        style?.bold && "font-bold",
        style?.italic && "italic",
        style?.underline && "underline",
        style?.fontSize === "small" && "text-sm",
        style?.fontSize === "large" && "text-lg"
      )}
      style={{ color: style?.color }}
    >
      {block.value}
    </span>
  );
}

function MarkdownBlockRenderer({ block }: { block: MarkdownBlock }) {
  // For now, render as plain text. Could integrate react-markdown later.
  return <div className="prose prose-sm max-w-none">{block.content}</div>;
}

function LatexBlockRenderer({ block }: { block: LatexBlock }) {
  // For now, render as code. Could integrate KaTeX later.
  return (
    <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
      {block.value}
    </code>
  );
}

function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  return (
    <img
      src={block.url}
      alt={block.alt || "Question image"}
      className="max-w-full h-auto rounded-lg my-2"
    />
  );
}

function AudioBlockRenderer({ block }: { block: AudioBlock }) {
  return (
    <audio controls className="w-full my-2">
      <source src={block.url} />
      Your browser does not support the audio element.
    </audio>
  );
}

function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  // Check if it's a YouTube link
  const isYouTube = block.url.includes("youtube.com") || block.url.includes("youtu.be");

  if (isYouTube) {
    // Extract video ID and create embed URL
    let videoId = "";
    if (block.url.includes("youtu.be/")) {
      videoId = block.url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (block.url.includes("v=")) {
      videoId = block.url.split("v=")[1]?.split("&")[0] || "";
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
      <source src={block.url} type="video/mp4" />
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
      return <span key={index}>{unknownBlock.value || unknownBlock.content || unknownBlock.text || ""}</span>;
  }
}

export const RichContentRenderer = memo(function RichContentRenderer({ content, className }: RichContentRendererProps) {
  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className={cn("rich-content", className)}>
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
          return block.value;
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
