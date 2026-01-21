"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import React from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/buttons/primary-button";
import { AddNewExamDialog } from "./add-new-exam-dialog";
import { useAllExamTypes, ExamTypesResponse } from "../api/exam-types/get-all-exam-types";
import { useSubjects, SubjectsResponse } from "@/features/subjects/api/subject/get-subjects";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const ExamStatsCards = () => {
  const router = useRouter();

  // Fetch exam types count
  const { data: examTypesData, isLoading: isLoadingExams } = useAllExamTypes({
    limit: 1,
  }) as {
    data: ExamTypesResponse | undefined;
    isLoading: boolean;
  };

  // Fetch subjects count
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects({
    limit: 1,
  }) as {
    data: SubjectsResponse | undefined;
    isLoading: boolean;
  };

  const totalExams = examTypesData?.total || 0;
  const totalSubjects = subjectsData?.total || 0;

  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 ">
      <div
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push("/exams")}
      >
        {isLoadingExams ? (
          <Card className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ) : (
          <StatsCard
            positive
            prefix=""
            title="All Exams"
            value={totalExams}
            toolbar={<StatsCard.Menu />}
          />
        )}
      </div>
      <div
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push("/subjects")}
      >
        {isLoadingSubjects ? (
          <Card className="p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ) : (
          <StatsCard
            positive
            prefix=""
            title="All Subjects"
            value={totalSubjects}
            toolbar={<StatsCard.Menu />}
          />
        )}
      </div>
      <AddNewExamDialog>
        <PrimaryButton className=" ml-auto my-auto" title="Add new Exam" />
      </AddNewExamDialog>
    </div>
  );
};

export default ExamStatsCards;
