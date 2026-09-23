import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  ProfessionalComponent,
  ProfessionalDomain,
  ProfessionalHierarchyResponse,
} from "@/api/types/exam.types";

interface ProfessionalHierarchyPickerProps {
  hierarchy?: ProfessionalHierarchyResponse;
  value: string[];
  onChange: (value: string[]) => void;
  isLoading: boolean;
  isError: boolean;
}

const CLOSED_COMPONENT = "__closed__";

function getQuestionCount(item: ProfessionalComponent | ProfessionalDomain) {
  return item.questionCount ?? item._count?.questions ?? 0;
}

function getDomains(hierarchy: ProfessionalHierarchyResponse) {
  return hierarchy.professionalTracks.flatMap((track) => track.components);
}

export function ProfessionalHierarchyPicker({
  hierarchy,
  value,
  onChange,
  isLoading,
  isError,
}: ProfessionalHierarchyPickerProps) {
  const components = hierarchy ? getDomains(hierarchy) : [];
  const [openComponentId, setOpenComponentId] = useState<string | null>(
    null,
  );
  const activeOpenComponentId =
    openComponentId === CLOSED_COMPONENT
      ? null
      : components.some((component) => component.id === openComponentId)
        ? openComponentId
        : components[0]?.id ?? null;

  const selectableDomains = components.flatMap((component) =>
    component.domains.filter((domain) => getQuestionCount(domain) > 0),
  );
  const selectedCount = value.length;
  const selectedQuestionCount = selectableDomains
    .filter((domain) => value.includes(domain.id))
    .reduce((total, domain) => total + getQuestionCount(domain), 0);

  const toggleDomain = (domainId: string) => {
    onChange(
      value.includes(domainId)
        ? value.filter((id) => id !== domainId)
        : [...value, domainId],
    );
  };

  const toggleComponent = (component: ProfessionalComponent) => {
    const domains = component.domains
      .filter((domain) => getQuestionCount(domain) > 0)
      .map((domain) => domain.id);
    const allSelected = domains.every((domainId) => value.includes(domainId));
    onChange(
      allSelected
        ? value.filter((id) => !domains.includes(id))
        : [...new Set([...value, ...domains])],
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] px-4 py-4 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading topics and sections...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-500">
        Failed to load topics and sections. Please try again.
      </div>
    );
  }

  if (!hierarchy || components.length === 0) {
    return (
      <p className="py-4 text-sm text-gray-500">
        No topics or sections available for this exam type.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 rounded-2xl bg-[#F7F8F5] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#101828]">{hierarchy.name}</p>
          <p className="mt-0.5 text-xs text-[#667085]">
            Choose the topics you want to practice
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-accent">{selectedCount} selected</p>
          {selectedQuestionCount > 0 && (
            <p className="text-[11px] text-[#667085]">
              {selectedQuestionCount} questions
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {hierarchy.professionalTracks.map((track) => (
          <div key={track.id} className="space-y-2">
            <p className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
              {track.name}
            </p>
            {track.components.map((component) => {
              const domains = component.domains.filter(
                (domain) => getQuestionCount(domain) > 0,
              );
              const selectedDomains = domains.filter((domain) =>
                value.includes(domain.id),
              );
              const isOpen = activeOpenComponentId === component.id;
              const allSelected = domains.length > 0 && selectedDomains.length === domains.length;

              return (
                <div
                  key={component.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
                >
                  <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${component.name}`}
                      onClick={() =>
                        setOpenComponentId(isOpen ? CLOSED_COMPONENT : component.id)
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#98A2B3] transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#101828]">
                          {component.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#98A2B3]">
                          {domains.length > 0
                            ? `${selectedDomains.length}/${domains.length} topics selected`
                            : "No topics available"}
                        </span>
                      </span>
                    </button>
                    {domains.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleComponent(component)}
                        className="shrink-0 text-xs font-semibold text-accent hover:text-accent/70"
                      >
                        {allSelected ? "Clear" : "All"}
                      </button>
                    )}
                  </div>

                  {isOpen && domains.length > 0 && (
                    <div className="border-t border-[#F0F2F4] bg-[#FCFCFB] px-3 py-2 sm:px-4">
                      {component.domains.map((domain) => {
                        const questionCount = getQuestionCount(domain);
                        const isSelected = value.includes(domain.id);
                        const disabled = questionCount === 0;

                        return (
                          <div
                            key={domain.id}
                            role="button"
                            tabIndex={disabled ? -1 : 0}
                            aria-disabled={disabled}
                            onClick={() => !disabled && toggleDomain(domain.id)}
                            onKeyDown={(event) => {
                              if (!disabled && (event.key === "Enter" || event.key === " ")) {
                                event.preventDefault();
                                toggleDomain(domain.id);
                              }
                            }}
                            className="flex w-full items-center gap-3 border-b border-[#F0F2F4] py-3 text-left last:border-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={disabled}
                              onCheckedChange={() => toggleDomain(domain.id)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Select ${domain.name}`}
                            />
                            <span className="min-w-0 flex-1 truncate text-sm text-[#344054]">
                              {domain.name}
                            </span>
                            <span className="shrink-0 text-xs text-[#98A2B3]">
                              {disabled ? "No questions" : `${questionCount} questions`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}