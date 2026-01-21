import React from "react";
import { AppSidebarContent, PageHeader } from "@/components/globals";
import ExamStatsCards from "../../../features/exams/components/exam-stats-card";
import ExamTable from "@/features/exams/components/exam-table";
import SubjectStatsCards from "@/features/subjects/components/subject-stats-card";
import SubjectTable from "@/features/subjects/components/subject-table";

const SubjectsPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <SubjectStatsCards />
      <SubjectTable />
    </AppSidebarContent>
  );
};

export default SubjectsPage;
