import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useTutorials } from "@/feature/tutorials/hooks";
import { BookOpen, Books } from "@phosphor-icons/react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { TutorialListItem } from "@/api/types/tutorial.types";
import type { FilterOption } from "@/components/global/custom-page-header";

function TextbookCard({ textbook }: { textbook: TutorialListItem }) {
  return (
    <Link
      to="/textbooks/$textbookId"
      params={{ textbookId: textbook.id }}
      className="group block rounded-xl border border-[#EBEBEB] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Cover image */}
      <div className="relative bg-[#FFF7F0] p-6 flex items-center justify-center">
        <img
          width={1000}
          height={1000}
          alt={textbook.name}
          src="/img/algebra.png"
          className="h-24 w-32 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2.5 shadow-sm">
            <BookOpen weight="fill" className="w-5 h-5 text-[#F04F54]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h6 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {textbook.name}
        </h6>
        <p className="text-xs text-gray-500 mt-1">{textbook.subject?.name}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {textbook.chapterCount > 0 && (
            <span>{textbook.chapterCount} chapters</span>
          )}
          {textbook.subscriberCount > 0 && (
            <span>{textbook.subscriberCount} students</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TextbooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const {
    data: textbooks,
    isLoading,
    error,
  } = useTutorials({ type: "TEXT_TUTORIAL" });

  const filterOptions: FilterOption[] = useMemo(() => {
    if (!textbooks) return [];
    const subjects = new Map<string, string>();
    for (const t of textbooks) {
      if (t.subject?.name) {
        subjects.set(t.subject.name, t.subject.name);
      }
    }
    return Array.from(subjects.values())
      .sort()
      .map((name) => ({ label: name, value: name }));
  }, [textbooks]);

  const filteredTextbooks = useMemo(() => {
    if (!textbooks) return [];
    return textbooks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        !subjectFilter || t.subject?.name === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [textbooks, searchQuery, subjectFilter]);

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        heading="Textbooks"
        filter={true}
        subHeading="Read and learn at your own pace"
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search textbooks..."
        filterOptions={filterOptions}
        activeFilter={subjectFilter}
        onFilterChange={setSubjectFilter}
      />

      {isLoading && (
        <div className="py-10 text-center">Loading textbooks...</div>
      )}

      {error && (
        <div className="py-10 text-center text-red-500">
          Failed to load textbooks
        </div>
      )}

      {!isLoading && !error && filteredTextbooks.length === 0 && (
        <div className="py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Books className="w-6 h-6" />
              </EmptyMedia>
              <EmptyTitle>
                {textbooks && textbooks.length > 0
                  ? "No Matching Textbooks"
                  : "No Textbooks"}
              </EmptyTitle>
              <EmptyDescription>
                {textbooks && textbooks.length > 0
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "There are no textbooks available at the moment. Check back later for new content."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {!isLoading && !error && filteredTextbooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 py-8 sm:py-10">
          {filteredTextbooks.map((textbook) => (
            <TextbookCard key={textbook.id} textbook={textbook} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_user/textbooks/")({
  component: TextbooksPage,
});
