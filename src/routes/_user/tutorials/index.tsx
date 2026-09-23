import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useTutorials } from "@/feature/tutorials/hooks/useTutorials";
import { useExamPreferences } from "@/feature/exams/hooks/useExams";
import { Play, VideoCamera } from "@phosphor-icons/react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { TutorialListItem } from "@/api/types/tutorial.types";
import type { FilterOption } from "@/components/global/custom-page-header";

function TutorialCard({ tutorial }: { tutorial: TutorialListItem }) {
  return (
    <Link
      to="/tutorials/$tutorialId"
      params={{ tutorialId: tutorial.id }}
      className="group block rounded-xl border border-[#EBEBEB] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative bg-[#FFF0F0] p-6 flex items-center justify-center">
        <img
          width={1000}
          height={1000}
          alt={tutorial.name}
          src="/img/algebra.png"
          className="h-24 w-32 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2.5 shadow-sm">
            <Play weight="fill" className="w-5 h-5 text-[#F04F54]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h6 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {tutorial.name}
        </h6>
        <p className="text-xs text-gray-500 mt-1">{tutorial.topic?.name || tutorial.subject?.name}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          {tutorial.chapterCount > 0 && (
            <span>{tutorial.chapterCount} chapters</span>
          )}
          {tutorial.subscriberCount > 0 && (
            <span>{tutorial.subscriberCount} students</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TutorialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const { data: preferences, isLoading: isLoadingPreferences } = useExamPreferences();
  const isProfessional = preferences?.examCategory === "PROFESSIONAL";

  const {
    data: tutorials,
    isLoading: isLoadingTutorials,
    error,
  } = useTutorials({ 
    type: isProfessional ? undefined : "VIDEO_TUTORIAL",
    examTypeId: isProfessional ? preferences?.examTypeId : undefined,
  }, { enabled: !isLoadingPreferences });

  const isLoading = isLoadingPreferences || isLoadingTutorials;

  const filterOptions: FilterOption[] = useMemo(() => {
    if (!tutorials) return [];
    const filterKey = new Map<string, string>();
    for (const t of tutorials) {
      const name = t.topic?.name || t.subject?.name;
      if (name) {
        filterKey.set(name, name);
      }
    }
    return Array.from(filterKey.values())
      .sort()
      .map((name) => ({ label: name, value: name }));
  }, [tutorials]);

  const filteredTutorials = useMemo(() => {
    if (!tutorials) return [];
    return tutorials.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const filterName = t.topic?.name || t.subject?.name;
      const matchesSubject =
        !subjectFilter || filterName === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [tutorials, searchQuery, subjectFilter]);

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        heading={isProfessional ? "OSCE & Viva Support" : "Video Tutorials"}
        filter={true}
        subHeading={isProfessional ? "Clinical skills and project preparation" : "Watch and learn at your own pace"}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder={isProfessional ? "Search clinical topics..." : "Search tutorials..."}
        filterOptions={filterOptions}
        activeFilter={subjectFilter}
        onFilterChange={setSubjectFilter}
      />

      {isLoading && (
        <div className="py-10 text-center">Loading tutorials...</div>
      )}

      {error && (
        <div className="py-10 text-center text-red-500">
          Failed to load tutorials
        </div>
      )}

      {!isLoading && !error && filteredTutorials.length === 0 && (
        <div className="py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <VideoCamera className="w-6 h-6" />
              </EmptyMedia>
              <EmptyTitle>
                {tutorials && tutorials.length > 0
                  ? "No Matching Tutorials"
                  : isProfessional ? "No Clinical Resources" : "No Video Tutorials"}
              </EmptyTitle>
              <EmptyDescription>
                {tutorials && tutorials.length > 0
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "There are no tutorials available at the moment. Check back later for new content."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {!isLoading && !error && filteredTutorials.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 py-8 sm:py-10">
          {filteredTutorials.map((tutorial) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_user/tutorials/")({
  component: TutorialsPage,
});
