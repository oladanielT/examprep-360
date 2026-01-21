import type { JSONContent } from "@tiptap/react";

// ========== ENUMS ==========
export enum RichContentType {
  TEXT = "text",
  MARKDOWN = "markdown",
  LATEX = "latex",
  IMAGE = "image",
  TABLE = "table",
  CODE = "code",
  AUDIO = "audio",
  VIDEO = "video",
  DIAGRAM = "diagram",
  LIST = "list",
  QUOTE = "quote",
  TASK_LIST = "task_list",
}

// ========== TYPES ==========
export interface TextValue {
  content: string;
}

export interface MarkdownValue {
  content: string;
  formatting: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    subscript?: boolean;
    superscript?: boolean;
    link?: string;
    heading?: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ImageValue {
  src: string;
  alt?: string;
  title?: string;
}

export interface VideoValue {
  src: string;
  title?: string;
}

export interface AudioValue {
  src: string;
  title?: string;
}

export interface CodeValue {
  language?: string;
  content: string;
}

export interface ListValue {
  ordered: boolean;
  items: string[];
}

export interface TaskListValue {
  items: { text: string; checked: boolean }[];
}

export interface TableValue {
  headers: string[];
  rows: string[][];
}

export interface LatexValue {
  equation: string;
  displayMode: boolean;
}

export interface QuoteValue {
  content: string;
}

export type RichContentValue =
  | string
  | TextValue
  | MarkdownValue
  | ImageValue
  | VideoValue
  | AudioValue
  | CodeValue
  | ListValue
  | TaskListValue
  | TableValue
  | LatexValue
  | QuoteValue;

export interface RichContentBlock {
  type: RichContentType;
  value: RichContentValue;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Extracts plain text from a Tiptap node with text content
 */
function extractTextFromNode(node: JSONContent): string {
  if (!node.content) return "";

  return node.content
    .map((child) => {
      if (child.type === "text") {
        return child.text || "";
      }
      // Handle nested content
      if (child.content) {
        return extractTextFromNode(child);
      }
      return "";
    })
    .join("");
}

/**
 * Extracts text marks (bold, italic, etc.) from a text node
 */
function extractMarks(node: JSONContent): MarkdownValue["formatting"] {
  if (!node.content) return {};

  const formatting: MarkdownValue["formatting"] = {};

  node.content.forEach((child) => {
    if (child.marks) {
      child.marks.forEach((mark) => {
        switch (mark.type) {
          case "bold":
            formatting.bold = true;
            break;
          case "italic":
            formatting.italic = true;
            break;
          case "underline":
            formatting.underline = true;
            break;
          case "strike":
            formatting.strikethrough = true;
            break;
          case "code":
            formatting.code = true;
            break;
          case "subscript":
            formatting.subscript = true;
            break;
          case "superscript":
            formatting.superscript = true;
            break;
          case "link":
            formatting.link = (mark.attrs as { href?: string })?.href;
            break;
        }
      });
    }
  });

  return formatting;
}

/**
 * Checks if formatting object has any formatting applied
 */
function hasFormatting(formatting: MarkdownValue["formatting"]): boolean {
  return Object.keys(formatting).length > 0;
}

/**
 * Checks if a paragraph contains LaTeX math
 */
function containsLatex(node: JSONContent): boolean {
  const text = extractTextFromNode(node);
  return text.includes("$") && /\$[^$]+\$/.test(text);
}

/**
 * Extracts LaTeX from text (handles both inline $...$ and display $$...$$)
 */
function extractLatex(
  text: string
): { equation: string; displayMode: boolean } | null {
  // Check for display mode first ($$...$$)
  const displayMatch = text.match(/\$\$([^$]+)\$\$/);
  if (displayMatch) {
    return { equation: displayMatch[1].trim(), displayMode: true };
  }

  // Check for inline mode ($...$)
  const inlineMatch = text.match(/\$([^$]+)\$/);
  if (inlineMatch) {
    return { equation: inlineMatch[1].trim(), displayMode: false };
  }

  return null;
}

/**
 * Extracts list items from a Tiptap list node
 */
function extractListItems(node: JSONContent): string[] {
  if (!node.content) return [];

  return node.content.map((listItem) => {
    if (listItem.type === "listItem" && listItem.content) {
      return listItem.content
        .map((paragraph) => extractTextFromNode(paragraph))
        .join("\n");
    }
    return "";
  });
}

/**
 * Extracts task list items from a Tiptap taskList node
 */
function extractTaskListItems(
  node: JSONContent
): { text: string; checked: boolean }[] {
  if (!node.content) return [];

  return node.content.map((taskItem) => {
    const checked = taskItem.attrs?.checked ?? false;
    const text = taskItem.content
      ? taskItem.content.map((p) => extractTextFromNode(p)).join("\n")
      : "";
    return { text, checked };
  });
}

/**
 * Extracts table data from a Tiptap table node
 */
function extractTableData(node: JSONContent): TableValue {
  const headers: string[] = [];
  const rows: string[][] = [];

  if (!node.content) return { headers, rows };

  node.content.forEach((row, rowIndex) => {
    if (row.type === "tableRow" && row.content) {
      const rowData: string[] = [];

      row.content.forEach((cell) => {
        const cellText = cell.content
          ? cell.content.map((p) => extractTextFromNode(p)).join("\n")
          : "";

        if (cell.type === "tableHeader" || rowIndex === 0) {
          headers.push(cellText);
        } else {
          rowData.push(cellText);
        }
      });

      if (rowIndex > 0 && rowData.length > 0) {
        rows.push(rowData);
      }
    }
  });

  return { headers, rows };
}

// ========== MAIN TRANSFORMER ==========

/**
 * Transforms Tiptap JSONContent to RichContentBlock array
 */
export function tiptapToRichContent(json: JSONContent): RichContentBlock[] {
  const blocks: RichContentBlock[] = [];

  if (!json.content) return blocks;

  for (const node of json.content) {
    switch (node.type) {
      case "paragraph": {
        const text = extractTextFromNode(node);
        if (!text.trim()) continue; // Skip empty paragraphs

        // Check if it contains LaTeX
        if (containsLatex(node)) {
          const latex = extractLatex(text);
          if (latex) {
            blocks.push({
              type: RichContentType.LATEX,
              value: latex,
            });
          }
        } else {
          const formatting = extractMarks(node);
          if (hasFormatting(formatting)) {
            // Has formatting - use MARKDOWN type
            blocks.push({
              type: RichContentType.MARKDOWN,
              value: { content: text, formatting },
            });
          } else {
            // Plain text
            blocks.push({
              type: RichContentType.TEXT,
              value: text,
            });
          }
        }
        break;
      }

      case "heading": {
        const level = (node.attrs?.level || 1) as 1 | 2 | 3 | 4 | 5 | 6;
        const content = extractTextFromNode(node);
        blocks.push({
          type: RichContentType.MARKDOWN,
          value: { content, formatting: { heading: level } },
        });
        break;
      }

      case "bulletList":
      case "orderedList": {
        const items = extractListItems(node);
        blocks.push({
          type: RichContentType.LIST,
          value: {
            ordered: node.type === "orderedList",
            items,
          },
        });
        break;
      }

      case "taskList": {
        const items = extractTaskListItems(node);
        blocks.push({
          type: RichContentType.TASK_LIST,
          value: { items },
        });
        break;
      }

      case "blockquote": {
        const content = node.content
          ? node.content.map((p) => extractTextFromNode(p)).join("\n")
          : "";
        blocks.push({
          type: RichContentType.QUOTE,
          value: { content },
        });
        break;
      }

      case "codeBlock": {
        const language = node.attrs?.language || "";
        const content = extractTextFromNode(node);
        blocks.push({
          type: RichContentType.CODE,
          value: { language, content },
        });
        break;
      }

      case "image": {
        blocks.push({
          type: RichContentType.IMAGE,
          value: {
            src: node.attrs?.src || "",
            alt: node.attrs?.alt,
            title: node.attrs?.title,
          },
        });
        break;
      }

      case "video": {
        blocks.push({
          type: RichContentType.VIDEO,
          value: {
            src: node.attrs?.src || "",
            title: node.attrs?.title,
          },
        });
        break;
      }

      case "audio": {
        blocks.push({
          type: RichContentType.AUDIO,
          value: {
            src: node.attrs?.src || "",
            title: node.attrs?.title,
          },
        });
        break;
      }

      case "table": {
        const tableData = extractTableData(node);
        blocks.push({
          type: RichContentType.TABLE,
          value: tableData,
        });
        break;
      }

      case "horizontalRule": {
        // Could add a separator type if needed
        break;
      }

      default:
        // Log unhandled types for debugging
        console.warn(`Unhandled Tiptap node type: ${node.type}`);
        break;
    }
  }

  return blocks;
}

// ========== REVERSE TRANSFORMER ==========

/**
 * Transforms RichContentBlock array back to Tiptap JSONContent
 */
export function richContentToTiptap(blocks: RichContentBlock[]): JSONContent {
  const content: JSONContent[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case RichContentType.TEXT: {
        const textValue =
          typeof block.value === "string"
            ? block.value
            : (block.value as TextValue).content;

        content.push({
          type: "paragraph",
          content: [{ type: "text", text: textValue }],
        });
        break;
      }

      case RichContentType.MARKDOWN: {
        const markdownValue = block.value as MarkdownValue;
        const textNode: JSONContent = {
          type: "text",
          text: markdownValue.content,
        };

        // Apply marks
        const marks: Array<{ type: string; attrs?: Record<string, unknown> }> =
          [];
        if (markdownValue.formatting.bold) marks.push({ type: "bold" });
        if (markdownValue.formatting.italic) marks.push({ type: "italic" });
        if (markdownValue.formatting.underline)
          marks.push({ type: "underline" });
        if (markdownValue.formatting.strikethrough)
          marks.push({ type: "strike" });
        if (markdownValue.formatting.code) marks.push({ type: "code" });
        if (markdownValue.formatting.subscript)
          marks.push({ type: "subscript" });
        if (markdownValue.formatting.superscript)
          marks.push({ type: "superscript" });
        if (markdownValue.formatting.link) {
          marks.push({
            type: "link",
            attrs: { href: markdownValue.formatting.link },
          });
        }

        if (marks.length > 0) {
          textNode.marks = marks;
        }

        // Check if it's a heading
        if (markdownValue.formatting.heading) {
          content.push({
            type: "heading",
            attrs: { level: markdownValue.formatting.heading },
            content: [textNode],
          });
        } else {
          content.push({
            type: "paragraph",
            content: [textNode],
          });
        }
        break;
      }

      case RichContentType.LATEX: {
        const latexValue = block.value as LatexValue;
        const delimiter = latexValue.displayMode ? "$$" : "$";
        content.push({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `${delimiter}${latexValue.equation}${delimiter}`,
            },
          ],
        });
        break;
      }

      case RichContentType.LIST: {
        const listValue = block.value as ListValue;
        content.push({
          type: listValue.ordered ? "orderedList" : "bulletList",
          content: listValue.items.map((item) => ({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: item }],
              },
            ],
          })),
        });
        break;
      }

      case RichContentType.TASK_LIST: {
        const taskListValue = block.value as TaskListValue;
        content.push({
          type: "taskList",
          content: taskListValue.items.map((item) => ({
            type: "taskItem",
            attrs: { checked: item.checked },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: item.text }],
              },
            ],
          })),
        });
        break;
      }

      case RichContentType.QUOTE: {
        const quoteValue = block.value as QuoteValue;
        content.push({
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: quoteValue.content }],
            },
          ],
        });
        break;
      }

      case RichContentType.CODE: {
        const codeValue = block.value as CodeValue;
        content.push({
          type: "codeBlock",
          attrs: { language: codeValue.language || null },
          content: [{ type: "text", text: codeValue.content }],
        });
        break;
      }

      case RichContentType.IMAGE: {
        const imageValue = block.value as ImageValue;
        content.push({
          type: "image",
          attrs: {
            src: imageValue.src,
            alt: imageValue.alt || null,
            title: imageValue.title || null,
          },
        });
        break;
      }

      case RichContentType.VIDEO: {
        const videoValue = block.value as VideoValue;
        content.push({
          type: "video",
          attrs: {
            src: videoValue.src,
            title: videoValue.title || null,
          },
        });
        break;
      }

      case RichContentType.AUDIO: {
        const audioValue = block.value as AudioValue;
        content.push({
          type: "audio",
          attrs: {
            src: audioValue.src,
            title: audioValue.title || null,
          },
        });
        break;
      }

      case RichContentType.TABLE: {
        const tableValue = block.value as TableValue;
        const tableContent: JSONContent[] = [];

        // Header row
        if (tableValue.headers.length > 0) {
          tableContent.push({
            type: "tableRow",
            content: tableValue.headers.map((header) => ({
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: header }],
                },
              ],
            })),
          });
        }

        // Data rows
        tableValue.rows.forEach((row) => {
          tableContent.push({
            type: "tableRow",
            content: row.map((cell) => ({
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: cell }],
                },
              ],
            })),
          });
        });

        content.push({
          type: "table",
          content: tableContent,
        });
        break;
      }

      default:
        console.warn(`Unhandled RichContentType: ${block.type}`);
        break;
    }
  }

  return {
    type: "doc",
    content,
  };
}

// ========== API COMPATIBILITY ==========

/**
 * API-compatible RichContentBlock format (value is always a string)
 */
export interface APIRichContentBlock {
  type: "text" | "markdown" | "latex" | "image" | "video" | "audio" | "code";
  value: string;
  metadata?: Record<string, unknown>;
}

/**
 * Converts RichContentBlock[] to API-compatible format
 * Serializes complex values to JSON strings and filters unsupported types
 */
export function richContentToAPIFormat(
  blocks: RichContentBlock[]
): APIRichContentBlock[] {
  const apiBlocks: APIRichContentBlock[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case RichContentType.TEXT: {
        const textValue =
          typeof block.value === "string"
            ? block.value
            : (block.value as TextValue).content;
        apiBlocks.push({
          type: "text",
          value: textValue,
        });
        break;
      }

      case RichContentType.MARKDOWN: {
        const markdownValue = block.value as MarkdownValue;
        // Serialize the markdown value to JSON string
        apiBlocks.push({
          type: "markdown",
          value: JSON.stringify(markdownValue),
        });
        break;
      }

      case RichContentType.LATEX: {
        const latexValue = block.value as LatexValue;
        // Serialize the latex value to JSON string
        apiBlocks.push({
          type: "latex",
          value: JSON.stringify(latexValue),
        });
        break;
      }

      case RichContentType.IMAGE: {
        const imageValue = block.value as ImageValue;
        // Serialize the image value to JSON string
        apiBlocks.push({
          type: "image",
          value: JSON.stringify(imageValue),
        });
        break;
      }

      case RichContentType.VIDEO: {
        const videoValue = block.value as VideoValue;
        // Serialize the video value to JSON string
        apiBlocks.push({
          type: "video",
          value: JSON.stringify(videoValue),
        });
        break;
      }

      case RichContentType.AUDIO: {
        const audioValue = block.value as AudioValue;
        // Serialize the audio value to JSON string
        apiBlocks.push({
          type: "audio",
          value: JSON.stringify(audioValue),
        });
        break;
      }

      case RichContentType.CODE: {
        const codeValue = block.value as CodeValue;
        // Serialize the code value to JSON string
        apiBlocks.push({
          type: "code",
          value: JSON.stringify(codeValue),
        });
        break;
      }

      case RichContentType.LIST: {
        // Convert list to text format
        const listValue = block.value as ListValue;
        const listText = listValue.items
          .map((item, index) => {
            const prefix = listValue.ordered ? `${index + 1}. ` : "• ";
            return `${prefix}${item}`;
          })
          .join("\n");
        apiBlocks.push({
          type: "text",
          value: listText,
        });
        break;
      }

      case RichContentType.QUOTE: {
        // Convert quote to text format
        const quoteValue = block.value as QuoteValue;
        apiBlocks.push({
          type: "text",
          value: `> ${quoteValue.content}`,
        });
        break;
      }

      case RichContentType.TASK_LIST: {
        // Convert task list to text format
        const taskListValue = block.value as TaskListValue;
        const taskListText = taskListValue.items
          .map((item) => {
            const checkbox = item.checked ? "[x]" : "[ ]";
            return `${checkbox} ${item.text}`;
          })
          .join("\n");
        apiBlocks.push({
          type: "text",
          value: taskListText,
        });
        break;
      }

      case RichContentType.TABLE: {
        // Convert table to markdown-style text
        const tableValue = block.value as TableValue;
        const tableText = [
          `| ${tableValue.headers.join(" | ")} |`,
          `| ${tableValue.headers.map(() => "---").join(" | ")} |`,
          ...tableValue.rows.map((row) => `| ${row.join(" | ")} |`),
        ].join("\n");
        apiBlocks.push({
          type: "text",
          value: tableText,
        });
        break;
      }

      case RichContentType.DIAGRAM: {
        // Convert diagram to text (just a placeholder)
        apiBlocks.push({
          type: "text",
          value: "[Diagram content]",
        });
        break;
      }

      default:
        console.warn(`Unhandled RichContentType: ${block.type}`);
        break;
    }
  }

  return apiBlocks;
}

/**
 * Converts API-compatible format back to RichContentBlock[]
 * Deserializes JSON strings back to their original types
 */
export function apiFormatToRichContent(
  apiBlocks: APIRichContentBlock[]
): RichContentBlock[] {
  const blocks: RichContentBlock[] = [];

  for (const apiBlock of apiBlocks) {
    switch (apiBlock.type) {
      case "text": {
        blocks.push({
          type: RichContentType.TEXT,
          value: apiBlock.value,
        });
        break;
      }

      case "markdown": {
        try {
          const markdownValue = JSON.parse(apiBlock.value) as MarkdownValue;
          blocks.push({
            type: RichContentType.MARKDOWN,
            value: markdownValue,
          });
        } catch {
          // Fallback to plain text if parsing fails
          blocks.push({
            type: RichContentType.TEXT,
            value: apiBlock.value,
          });
        }
        break;
      }

      case "latex": {
        try {
          const latexValue = JSON.parse(apiBlock.value) as LatexValue;
          blocks.push({
            type: RichContentType.LATEX,
            value: latexValue,
          });
        } catch {
          // Fallback to plain text if parsing fails
          blocks.push({
            type: RichContentType.TEXT,
            value: apiBlock.value,
          });
        }
        break;
      }

      case "image": {
        try {
          const imageValue = JSON.parse(apiBlock.value) as ImageValue;
          blocks.push({
            type: RichContentType.IMAGE,
            value: imageValue,
          });
        } catch (error) {
          console.warn("Failed to parse image value:", error);
        }
        break;
      }

      case "video": {
        try {
          const videoValue = JSON.parse(apiBlock.value) as VideoValue;
          blocks.push({
            type: RichContentType.VIDEO,
            value: videoValue,
          });
        } catch (error) {
          console.warn("Failed to parse video value:", error);
        }
        break;
      }

      case "audio": {
        try {
          const audioValue = JSON.parse(apiBlock.value) as AudioValue;
          blocks.push({
            type: RichContentType.AUDIO,
            value: audioValue,
          });
        } catch (error) {
          console.warn("Failed to parse audio value:", error);
        }
        break;
      }

      case "code": {
        try {
          const codeValue = JSON.parse(apiBlock.value) as CodeValue;
          blocks.push({
            type: RichContentType.CODE,
            value: codeValue,
          });
        } catch {
          // Fallback to plain text if parsing fails
          blocks.push({
            type: RichContentType.TEXT,
            value: apiBlock.value,
          });
        }
        break;
      }

      default:
        console.warn(`Unhandled API block type: ${apiBlock.type}`);
        break;
    }
  }

  return blocks;
}

/**
 * Converts API-compatible format directly to Tiptap JSONContent
 * This is a convenience function that chains apiFormatToRichContent and richContentToTiptap
 */
export function apiFormatToTiptap(
  apiBlocks: APIRichContentBlock[]
): JSONContent {
  const richContent = apiFormatToRichContent(apiBlocks);
  return richContentToTiptap(richContent);
}
