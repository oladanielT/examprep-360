"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import React from "react";
import { Button } from "@/components/ui/base-button";


const SalesStatsCards = () => {
  return (
     <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
              positive={stat.positive}
              // formatType={stat.formatType}
              // Conditionally render the toolbar
              toolbar={stat.withMenu ? <StatsCard.Menu /> : null}
            >
              {/* Conditionally render the graph as a child */}
              {stat.graphData && (
                <StatsCard.Graph
                  data={stat.graphData}
                  color={stat.color}
                  // formatType={stat.formatType}
                />
              )}
            </StatsCard>
          ))}
        </div>
  );
};

export default SalesStatsCards;

const statsData = [

  {
    title: "All Sales",
    value: 2000,
    delta: 100,
    positive: true,
    withMenu: true,
    graphData: [
      { value: 3000 },
      { value: 4500 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
    ],
    color: "#10b981",
  },
  {
    title: "Completed",
    value: 2000,
    delta: 100,
    positive: true,
    withMenu: true,
    graphData: [
      { value: 3000 },
      { value: 4500 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
    ],
    color: "#10b981",
  },
  {
    title: "Pending",
    value: 2000,
    delta: 100,
    positive: true,
    withMenu: true,
    graphData: [
      { value: 3000 },
      { value: 4500 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
    ],
    color: "#10b981",
  },

];
