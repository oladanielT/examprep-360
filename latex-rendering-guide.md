# LaTeX Rendering Guide for User Web App

## Overview

The admin app saves question content as an array of content blocks. The user app needs to handle LaTeX in two places:

1. **Standalone LaTeX blocks** — `{ type: "latex", value: "..." }`
2. **Inline LaTeX within text blocks** — `{ type: "text", value: "solve $x^2 + 2x = 0$ for x" }`

---

## 1. Standalone LaTeX Blocks

The API returns blocks like:

```json
{
  "type": "latex",
  "value": "x^2 + 2x + 1 = 0"
}
```

Or for display (centered/large) equations:

```json
{
  "type": "latex",
  "value": "$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$"
}
```

### How to render

```tsx
function renderLatexBlock(block: { type: string; value: string }) {
  let equation = block.value;
  let displayMode = false;

  // Check for display mode markers
  if (equation.startsWith("$$") && equation.endsWith("$$")) {
    equation = equation.slice(2, -2);
    displayMode = true;
  }

  // Using KaTeX:
  return (
    <div className={displayMode ? "text-center my-4" : "inline"}>
      <InlineMath math={equation} />           {/* inline */}
      {/* OR */}
      <BlockMath math={equation} />            {/* display/centered */}
    </div>
  );

  // Or using raw KaTeX:
  const html = katex.renderToString(equation, {
    displayMode,
    throwOnError: false,
  });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

---

## 2. Inline LaTeX Within Text Blocks

Text blocks may contain LaTeX wrapped in dollar signs:

```json
{
  "type": "text",
  "value": "Find the value of $x$ if $2x + 3 = 7$"
}
```

Display math can also appear in text blocks:

```json
{
  "type": "text",
  "value": "The quadratic formula is $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ where a, b, c are coefficients"
}
```

### How to render

Split the text on `$...$` and `$$...$$` boundaries and render each segment:

```tsx
function renderTextWithLatex(text: string) {
  // Regex matches $$...$$ (display) and $...$ (inline)
  // $$...$$ must be checked first (greedy match)
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          // Display math
          const eq = part.slice(2, -2);
          return <BlockMath key={i} math={eq} />;
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          // Inline math
          const eq = part.slice(1, -1);
          return <InlineMath key={i} math={eq} />;
        }
        // Plain text
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
```

---

## 3. Legacy Data

Some older questions may have LaTeX stored as a JSON string instead of a raw equation:

```json
{
  "type": "latex",
  "value": "{\"equation\":\"x^2\",\"displayMode\":false}"
}
```

Handle this gracefully:

```tsx
function parseLatexValue(value: string): { equation: string; displayMode: boolean } {
  // Try JSON parse first (legacy format)
  try {
    const parsed = JSON.parse(value);
    if (parsed.equation) {
      return { equation: parsed.equation, displayMode: parsed.displayMode ?? false };
    }
  } catch {
    // Not JSON, treat as raw equation
  }

  // Check for display mode markers
  if (value.startsWith("$$") && value.endsWith("$$")) {
    return { equation: value.slice(2, -2), displayMode: true };
  }

  return { equation: value, displayMode: false };
}
```

---

## 4. Full Content Block Renderer

Putting it all together for rendering a question's content array:

```tsx
import katex from "katex";
import "katex/dist/katex.min.css";
// OR use react-katex:
// import { InlineMath, BlockMath } from "react-katex";

interface ContentBlock {
  type: "text" | "latex" | "image" | "markdown" | "video" | "audio" | "code";
  value: string;
  metadata?: Record<string, any>;
}

function QuestionContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "latex": {
            const { equation, displayMode } = parseLatexValue(block.value);
            if (displayMode) {
              return <BlockMath key={i} math={equation} />;
            }
            return <InlineMath key={i} math={equation} />;
          }

          case "text":
            return <p key={i}>{renderTextWithLatex(block.value)}</p>;

          case "image":
            return <img key={i} src={block.value} alt="" />;

          // ... handle other types

          default:
            return <p key={i}>{block.value}</p>;
        }
      })}
    </div>
  );
}
```

---

## 5. Required Dependencies

```bash
# Option A: react-katex (recommended for React)
npm install react-katex katex
# import "katex/dist/katex.min.css" in your app entry

# Option B: raw katex
npm install katex
```

---

## Summary

| Format | Example | Render as |
|--------|---------|-----------|
| Raw equation | `x^2 + 1` | Inline math |
| `$$` wrapped | `$$\frac{a}{b}$$` | Display (centered) math |
| JSON string (legacy) | `{"equation":"x^2","displayMode":true}` | Based on `displayMode` field |
| `$...$` in text | `solve $x = 5$` | Inline math within text |
| `$$...$$` in text | `formula is $$\frac{a}{b}$$` | Display math within text |
