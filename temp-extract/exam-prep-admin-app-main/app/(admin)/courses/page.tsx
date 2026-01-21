"use client";

import React from "react";
import { AppSidebarContent, PageHeader } from "@/components/globals";
import CourseTable from "../../../features/courses/components/course-table";
import CourseStatsCards from "../../../features/courses/components/course-stats-card";

const CoursesPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="Courses"
        desc="Manage courses, modules, and academic sessions"
      />
      <CourseStatsCards />
      <CourseTable />
    </AppSidebarContent>
  );
};

export default CoursesPage;
