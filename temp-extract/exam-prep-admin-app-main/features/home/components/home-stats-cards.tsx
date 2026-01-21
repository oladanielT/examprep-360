"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import React from "react";

const StatsCards = () => {
  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
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

export default StatsCards;

// This can now be defined directly in the client component
const statsData = [
  {
    title: "Exams",
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
  },
  // --- Use Case 2: Stats and Menu, NO Graph ---
  {
    title: "Users",
    value: 2000,
    delta: 15.1,
    positive: true,
    withMenu: true,
    graphData: [
      { value: 3000 },
      { value: 4500 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
      { value: 4000 },
      { value: 6800 },
      { value: 8238 },
    ],
  },

  {
    title: "Higher Institutions",
    value: 2000,
    delta: 40.0,
    positive: true,
    graphData: [
      { value: 6800 },
      { value: 5500 },
      { value: 5000 },
      { value: 3800 },
      { value: 2238 },
      { value: 6800 },
      { value: 5500 },
      { value: 5000 },
      { value: 3800 },
      { value: 2238 },
      { value: 6800 },
      { value: 5500 },
      { value: 5000 },
      { value: 3800 },
      { value: 2238 },
    ],
    color: "#10b981",
  },
];
