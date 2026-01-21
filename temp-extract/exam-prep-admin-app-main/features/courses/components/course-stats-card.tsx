"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import React from "react";
import PrimaryButton from "@/components/buttons/primary-button";
import { AddCourseDialog } from "./add-course-dialog";

const CourseStatsCards = () => {
  return (
    <div className=" flex justify-between mt-10 ">
      <div className=" max-w-80 w-full">
        {statsData.map((stat) => (
          <StatsCard
            positive
            prefix=""
            key={stat.title}
            title={stat.title}
            value={stat.value}
            toolbar={stat.withMenu ? <StatsCard.Menu /> : null}
          />
        ))}
      </div>
      <AddCourseDialog>
        <PrimaryButton className=" my-auto" title="Create new Course" />
      </AddCourseDialog>
    </div>
  );
};

export default CourseStatsCards;

const statsData = [
  {
    title: "All Courses",
    value: 2000,

    withMenu: true,
  },
];
