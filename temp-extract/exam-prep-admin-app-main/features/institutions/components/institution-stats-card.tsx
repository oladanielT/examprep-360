"use client";

import PrimaryButton from "@/components/buttons/primary-button";
import { StatsCard } from "@/components/cards/graph-stats-card";
import { Button } from "@/components/ui/base-button";
import { AddInstitutionDialog } from "./add-institution-dialog";
import { useUniversities, UniversitiesResponse } from "../api/university/get-universities";
import { useCreateUniversity } from "../api/university/create-university";

const InstitutionStatsCards = () => {
  const { data, isLoading } = useUniversities({
    page: 1,
    limit: 100,
  }) as {
    data: UniversitiesResponse | undefined;
    isLoading: boolean;
  };

  const statsData = [
    {
      title: "All Universities",
      value: data?.total || 0,
    },
    {
      title: "Courses",
      value: 0, // TODO: Get actual course count when API is ready
    },
  ];

  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 ">
      {isLoading ? (
        // Loading skeletons
        <>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </>
      ) : (
        statsData.map((stat) => (
          <StatsCard
            positive
            prefix=""
            key={stat.title}
            title={stat.title}
            value={stat.value}
          />
        ))
      )}
      <AddInstitutionDialog>
        <PrimaryButton
          className=" my-auto ml-auto"
          title="Add new Higher Institution"
        />
      </AddInstitutionDialog>
    </div>
  );
};

export default InstitutionStatsCards;
