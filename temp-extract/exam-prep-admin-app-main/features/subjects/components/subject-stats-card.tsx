"use client";

import { StatsCard } from "@/components/cards/graph-stats-card";
import React from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/buttons/primary-button";
import { AddSubjectDialog } from "./add-subject-dialog";
import { useSubjects, SubjectsResponse } from "../api/subject/get-subjects";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const SubjectStatsCards = () => {
  const router = useRouter();

  // Fetch all subjects to get total count
  const { data: subjectsData, isLoading } = useSubjects({
    limit: 1, // We only need meta, not the actual data
  }) as {
    data: SubjectsResponse | undefined;
    isLoading: boolean;
  };

  const totalSubjects = subjectsData?.total || 0;

  return (
    <div className="flex justify-between mt-10">
      <div className="max-w-80 w-full">
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push("/subjects")}
        >
          {isLoading ? (
            <Card className="p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ) : (
            <StatsCard
              prefix=""
              title="All Subjects"
              value={totalSubjects}
              toolbar={<StatsCard.Menu />}
            />
          )}
        </div>
      </div>
      <AddSubjectDialog>
        <PrimaryButton title="Add new Subject" className="my-auto ml-auto" />
      </AddSubjectDialog>
    </div>
  );
};

export default SubjectStatsCards;
