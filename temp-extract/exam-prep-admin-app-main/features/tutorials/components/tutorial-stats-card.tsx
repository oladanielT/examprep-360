"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import { useAllTutorials } from "@/features/tutorials/api/tutorial/get-all-tutorials";

const TutorialStatsCards = () => {
  // Fetch all tutorials count
  const { data: allTutorials } = useAllTutorials({ limit: 1 });

  // Fetch text tutorials count
  const { data: textTutorials } = useAllTutorials({
    limit: 1,
    type: "TEXT_TUTORIAL",
  });

  // Fetch video tutorials count
  const { data: videoTutorials } = useAllTutorials({
    limit: 1,
    type: "VIDEO_TUTORIAL",
  });

  const statsData = [
    {
      title: "All Tutorials",
      value: allTutorials?.meta?.total || 0,
    },
    {
      title: "Text Tutorials",
      value: textTutorials?.meta?.total || 0,
    },
    {
      title: "Video Tutorials",
      value: videoTutorials?.meta?.total || 0,
    },
  ];

  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
      {statsData.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>
  );
};

export default TutorialStatsCards;
