import { useCallback, useEffect } from "react";
import { Info } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface QuestionCardProps {
  instruction?: string;
  children: ReactNode;
  // Disable copy / cut / right-click on the question content. On by default;
  // pass false in places where copying is intentional (none today).
  // Note: this only blocks casual copy — DevTools, screenshots, and OCR
  // still work. Use server-side measures for real anti-cheating.
  disableCopy?: boolean;
}

// Returns true when the event originated from a field the user types into
// themselves (answer inputs, textareas, contenteditable). Those should still
// allow copy/paste so the user can manage their own typed answers.
function isUserInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function QuestionCard({
  instruction,
  children,
  disableCopy = true,
}: QuestionCardProps) {
  const handleCopy = useCallback((e: React.ClipboardEvent) => {
    if (!isUserInput(e.target)) e.preventDefault();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isUserInput(e.target)) e.preventDefault();
  }, []);

  // Block Ctrl/Cmd + P (print) and Ctrl/Cmd + S (save page) while a question
  // card is on screen. We use a document-level listener so it fires regardless
  // of where focus is — the wrapper div doesn't naturally receive keydown.
  // The listener tears down with the component, so it's only active while
  // an exam screen is mounted.
  useEffect(() => {
    if (!disableCopy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (!isMeta) return;
      const key = e.key.toLowerCase();
      if (key === "p" || key === "s") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [disableCopy]);

  return (
    <div
      className={cn(
        "space-y-4",
        // select-none stops text-selection highlighting. The arbitrary
        // descendant overrides reopen selection for the user's own answer
        // fields so typing/paste still works there.
        disableCopy &&
          "select-none [&_input]:select-text [&_textarea]:select-text [&_[contenteditable]]:select-text"
      )}
      onCopy={disableCopy ? handleCopy : undefined}
      onCut={disableCopy ? handleCopy : undefined}
      onContextMenu={disableCopy ? handleContextMenu : undefined}
    >
      {/* Instruction Banner */}
      {instruction && (
        <div className="bg-gray-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-start gap-2.5 sm:gap-3">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info weight="bold" className="w-3 h-3" />
          </div>
          <p className="text-xs sm:text-sm">{instruction}</p>
        </div>
      )}

      {/* Question Content */}
      <Card className="p-4 sm:p-6">{children}</Card>
    </div>
  );
}
