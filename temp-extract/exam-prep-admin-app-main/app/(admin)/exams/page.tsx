import React from "react";
import { AppSidebarContent, PageHeader } from "@/components/globals";
import ExamStatsCards from "../../../features/exams/components/exam-stats-card";
import ExamTable from "@/features/exams/components/exam-table";

const ExamPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <ExamStatsCards />
      <ExamTable />
    </AppSidebarContent>
  );
};

export default ExamPage;
