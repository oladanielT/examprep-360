import { createFileRoute, Link } from "@tanstack/react-router";
import CustomCard from "@/components/global/custom-card";
import CustomPageHeader from "@/components/global/custom-page-header";
import { useTutorials } from "@/feature/tutorials/hooks";
import { Play, VideoCamera } from "@phosphor-icons/react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import type { TutorialListItem } from "@/api/types/tutorial.types";

function TutorialCard({ tutorial }: { tutorial: TutorialListItem }) {
  return (
    <Link to="/tutorials/$tutorialId" params={{ tutorialId: tutorial.id }}>
      <CustomCard
        className="cursor-pointer group"
        src="/img/algebra.png"
      >
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-2">
            <Play weight="fill" className="w-5 h-5 text-[#F04F54]" />
          </div>
        </div>
        <div className="pt-2">
          <h6 className="text-lg font-medium text-center line-clamp-2">
            {tutorial.name}
          </h6>
          <p className="text-sm text-gray-500 text-center mt-1">
            {tutorial.subject?.name}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400">
            {tutorial.chapterCount > 0 && (
              <span>{tutorial.chapterCount} chapters</span>
            )}
            {tutorial.subscriberCount > 0 && (
              <span>{tutorial.subscriberCount} students</span>
            )}
          </div>
        </div>
      </CustomCard>
    </Link>
  );
}

function TutorialsPage() {
  const { data: tutorials, isLoading, error } = useTutorials({ type: "VIDEO_TUTORIAL" });

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        heading="Video Tutorials"
        filter={true}
        subHeading="Watch and learn at your own pace"
      />

      {isLoading && (
        <div className="py-10 text-center">Loading tutorials...</div>
      )}

      {error && (
        <div className="py-10 text-center text-red-500">
          Failed to load tutorials
        </div>
      )}

      {!isLoading && !error && (!tutorials || tutorials.length === 0) && (
        <div className="py-20">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <VideoCamera className="w-6 h-6" />
              </EmptyMedia>
              <EmptyTitle>No Video Tutorials</EmptyTitle>
              <EmptyDescription>
                There are no video tutorials available at the moment. Check back later for new content.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {!isLoading && !error && tutorials && tutorials.length > 0 && (
        <div className="grid grid-cols-5 gap-5 py-10">
          {tutorials.map((tutorial) => (
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
