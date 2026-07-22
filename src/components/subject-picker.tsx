import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subject } from "@/api/types";
import { groupSubjectsBySchool, shouldGroupBySchool } from "@/lib/post-utme";

interface SubjectPickerProps {
  subjects: Subject[];
  /** Currently selected subject ids. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Max selectable. 1 = single-select (tapping another swaps it). */
  maxSubjects: number;
  className?: string;
}

/**
 * Subject selection used across registration, checkout, add, upgrade and the
 * in-app edit dialog. One place for the grouping, the Post-UTME accordion, and
 * the single-/multi-select rules.
 *
 * Selection is managed directly here rather than through a toggle-group
 * library: tapping a tile sets the value outright. This is what makes the
 * Post-UTME swap deterministic (Base UI's group reconciliation was the source
 * of the "must unselect first" bug).
 */
export function SubjectPicker({
  subjects,
  value,
  onChange,
  maxSubjects,
  className,
}: SubjectPickerProps) {
  // Which school section is expanded in the Post-UTME accordion (one at a time).
  const [openSchool, setOpenSchool] = useState<string | null>(null);

  const toggle = (id: string) => {
    const isSelected = value.includes(id);
    if (maxSubjects === 1) {
      // Single-select: tap to make it the sole pick, tap again to clear.
      onChange(isSelected ? [] : [id]);
      return;
    }
    if (isSelected) {
      onChange(value.filter((v) => v !== id));
    } else if (value.length < maxSubjects) {
      onChange([...value, id]);
    }
    // At the cap and not selected: no-op (the tile is also disabled).
  };

  // Render one tile. `label` is the short display text (a Post-UTME stream like
  // "Art"); the full subject name stays on aria-label for screen readers.
  const renderTile = (subject: Subject, label: string) => {
    const isSelected = value.includes(subject.id);
    const atLimit =
      maxSubjects > 1 && !isSelected && value.length >= maxSubjects;
    return (
      <button
        key={subject.id}
        type="button"
        aria-pressed={isSelected}
        aria-label={subject.name}
        disabled={atLimit}
        onClick={() => toggle(subject.id)}
        className={cn(
          "h-auto min-h-[56px] py-3 px-4 rounded-sm border-2",
          "inline-flex items-center justify-center max-w-full",
          "text-xs font-medium text-center whitespace-normal break-words",
          "transition-all duration-200",
          "hover:border-accent hover:bg-accent/5",
          isSelected
            ? "border-accent text-black"
            : "border-[#E5E5E5] text-black",
          atLimit &&
            "opacity-50 cursor-not-allowed hover:border-[#E5E5E5] hover:bg-transparent"
        )}
      >
        {label}
      </button>
    );
  };

  // Post-UTME: collapsed accordion. Tap a school to reveal its streams; only
  // one section is open at a time. The header shows the current pick so it's
  // visible while collapsed.
  if (shouldGroupBySchool(subjects)) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {groupSubjectsBySchool(subjects).map((group) => {
          const isOpen = openSchool === group.school;
          const picked = group.items.find(({ subject }) =>
            value.includes(subject.id)
          );
          return (
            <div
              key={group.school}
              className="border-2 border-[#E5E5E5] rounded-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenSchool(isOpen ? null : group.school)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-black">
                  {group.school}
                  {picked && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-accent">
                      <Check className="h-3.5 w-3.5" />
                      {picked.label}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-gray-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="flex flex-wrap gap-3 px-4 pb-4">
                  {group.items.map(({ subject, label }) =>
                    renderTile(subject, label)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Ordinary flat list (JAMB, WAEC, etc.).
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {subjects.map((subject) => renderTile(subject, subject.name))}
    </div>
  );
}
