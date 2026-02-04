# LaTeX/KaTeX Rendering Fix for Rich Content Editor

## Problem

Math questions from bulk upload showed raw `$...$` text instead of rendered KaTeX. For example, `$x^2 + y^2$` appeared as literal text instead of formatted math.

## Root Cause

The `apiFormatToRichContent` function in `rich-content.ts` had a bug in the `"latex"` case:

**API sends (according to docs):**
```json
{ "type": "latex", "value": "x^2 + y^2" }
```

**Code expected:**
```json
{ "type": "latex", "value": "{\"equation\":\"x^2 + y^2\",\"displayMode\":false}" }
```

When `JSON.parse("x^2 + y^2")` failed, the code fell back to creating a plain TEXT block, losing the math rendering.

---

## The Fix

### 1. Fix `apiFormatToRichContent` latex case

**File:** `src/lib/rich-content.ts`

**Before:**
```typescript
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
```

**After:**
```typescript
case "latex": {
  try {
    const latexValue = JSON.parse(apiBlock.value) as LatexValue;
    blocks.push({
      type: RichContentType.LATEX,
      value: latexValue,
    });
  } catch {
    // API-native format: raw LaTeX string in value (not JSON)
    blocks.push({
      type: RichContentType.LATEX,
      value: { equation: apiBlock.value, displayMode: false },
    });
  }
  break;
}
```

**Why:** When the API sends a raw LaTeX string (not JSON), we now create a proper LATEX block with the equation instead of falling back to plain text.

---

### 2. Remove leftover migration code (cleanup)

**File:** `src/features/questions/components/course-question-editor-full.tsx`

**Remove this import:**
```typescript
import { migrateMathStrings } from "@tiptap/extension-mathematics";
```

**Remove `onCreate` callbacks that call `migrateMathStrings`:**

Before:
```tsx
<EditorProvider
  onCreate={({ editor }) => {
    migrateMathStrings(editor);
  }}
  onUpdate={({ editor }) => {
    // ...
  }}
>
```

After:
```tsx
<EditorProvider
  onUpdate={({ editor }) => {
    // ...
  }}
>
```

**Why:** This was leftover code from a previous migration attempt. The fix in step 1 handles the conversion properly, so this is no longer needed.

---

## How the System Works

### Two ways LaTeX can appear in content:

#### 1. Embedded in text: `"The formula is $x^2 + y^2$ here"`

The `parseTextWithLatex` function handles this. It uses a regex to find `$...$` patterns and splits the text into nodes:

```typescript
function parseTextWithLatex(text: string): JSONContent[] {
  const nodes: JSONContent[] = [];
  const regex = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;
  // ... splits text and creates inlineMath nodes for $...$ patterns
}
```

This creates a single paragraph with mixed content:
- text node: `"The formula is "`
- inlineMath node: `{ latex: "x^2 + y^2" }`
- text node: `" here"`

#### 2. Separate LATEX block from API

```json
{ "type": "latex", "value": "x^2 + y^2" }
```

The `apiFormatToRichContent` converts this to:
```typescript
{ type: RichContentType.LATEX, value: { equation: "x^2 + y^2", displayMode: false } }
```

Then `richContentToTiptap` converts it to a Tiptap node:
```typescript
{
  type: "paragraph",
  content: [{
    type: "inlineMath",
    attrs: { latex: "x^2 + y^2" }
  }]
}
```

---

## Architecture Overview

```
API Response
    │
    ▼
apiFormatToRichContent()  ──►  RichContentBlock[]
    │                              │
    │                              │ (TEXT blocks keep $...$ in string)
    │                              │ (LATEX blocks have { equation, displayMode })
    │                              ▼
    │                      richContentToTiptap()
    │                              │
    │                              │ TEXT case: calls parseTextWithLatex()
    │                              │ LATEX case: creates inlineMath/blockMath node
    │                              ▼
    │                      Tiptap JSONContent
    │                              │
    │                              ▼
    │                      Editor renders with KaTeX
    ▼
┌─────────────────────────────────────────────────┐
│  Displayed: x² + y²  (rendered math)            │
└─────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/rich-content.ts` | Transforms between API format, RichContent blocks, and Tiptap JSON |
| `parseTextWithLatex()` | Extracts `$...$` from text strings into inlineMath nodes |
| `apiFormatToRichContent()` | Converts API response to internal RichContentBlock format |
| `richContentToTiptap()` | Converts RichContentBlock to Tiptap editor JSON |

---

## Verification

After making changes:

```bash
# Type check
npx tsc --noEmit

# Build
npx vite build
```

Then refresh the browser and load a math question. The `$...$` patterns should render as KaTeX math instead of raw text.

---

## Data Quality Note

If bulk upload produces content like `$99$ ^{\circ}` where `^{\circ}` is outside the dollar signs, it will render as:
- `99` in math font
- `^{\circ}` as raw text

The correct format should be `$99^{\circ}$`. This is a backend/bulk-upload data formatting issue, not a frontend code issue. The frontend correctly renders whatever is inside `$...$`.

---

## Summary

| Issue | Fix |
|-------|-----|
| Raw LaTeX string from API falls back to TEXT | Create LATEX block with `{ equation: value, displayMode: false }` in catch block |
| Leftover `migrateMathStrings` calls | Remove import and `onCreate` callbacks |
