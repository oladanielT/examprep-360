"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";


const QuestionStatsCards = () => {
  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 ">
      {statsData.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          delta={stat.delta}
          positive={stat.positive}

          toolbar={stat.withMenu ? <StatsCard.Menu /> : null}
        >
          {stat.graphData && (
            <StatsCard.Graph
              data={stat.graphData}
              color={stat.color}
            />
          )}
        </StatsCard>

      ))}
    </div>
  );
};

export default QuestionStatsCards;

// This can now be defined directly in the client component
const statsData = [
  {
    title: "All Questions",
    value: 2000,
    delta: 100,
    positive: true,
    graphData: [
      { value: 3000 },
      { value: 4500 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
    ],
    color: "#10b981",
    withMenu: true,
  },


];
