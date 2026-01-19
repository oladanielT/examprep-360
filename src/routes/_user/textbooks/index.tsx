import { createFileRoute, Link } from "@tanstack/react-router";
import CustomCard from "@/components/global/custom-card";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useTutorials } from "@/feature/tutorials/hooks";
import { BookOpen, Books } from "@phosphor-icons/react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import type { TutorialListItem } from "@/api/types/tutorial.types";

function TextbookCard({ textbook }: { textbook: TutorialListItem }) {
  return (
    <Link to="/textbooks/$textbookId" params={{ textbookId: textbook.id }}>
      <CustomCard
        className="cursor-pointer group"
        src="/img/algebra.png"
      >
        {/* Book icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2">
            <BookOpen weight="fill" className="w-5 h-5 text-[#F04F54]" />
          </div>
        </div>
        <div className="pt-2">
          <h6 className="text-lg font-medium text-center line-clamp-2">
            {textbook.name}
          </h6>
          <p className="text-sm text-gray-500 text-center mt-1">
            {textbook.subject?.name}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400">
            {textbook.chapterCount > 0 && (
              <span>{textbook.chapterCount} chapters</span>
            )}
            {textbook.subscriberCount > 0 && (
              <span>{textbook.subscriberCount} students</span>
            )}
          </div>
        </div>
      </CustomCard>
    </Link>
  );
}

function TextbooksPage() {
  const { data: textbooks, isLoading, error } = useTutorials({ type: "TEXT_TUTORIAL" });

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        heading="Textbooks"
        filter={true}
        subHeading="Read and learn at your own pace"
      />

      {isLoading && (
        <div className="py-10 text-center">Loading textbooks...</div>
      )}

      {error && (
        <div className="py-10 text-center text-red-500">
          Failed to load textbooks
        </div>
      )}

      {!isLoading && !error && (!textbooks || textbooks.length === 0) && (
        <div className="py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Books className="w-6 h-6" />
              </EmptyMedia>
              <EmptyTitle>No Textbooks</EmptyTitle>
              <EmptyDescription>
                There are no textbooks available at the moment. Check back later for new content.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {!isLoading && !error && textbooks && textbooks.length > 0 && (
        <div className="grid grid-cols-5 gap-5 py-10">
          {textbooks.map((textbook) => (
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
