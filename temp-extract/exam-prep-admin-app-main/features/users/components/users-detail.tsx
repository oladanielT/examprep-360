"use client";

import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { CustomTabs } from "@/components/custom/custom-tab";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React from "react";
import Details from "./users-details/details";
import Exams from "./users-details/exams";
import MockExams from "./users-details/mock-exams";
import { useStudent } from "../api/get-student";
import { StudentsResponse } from "../api/get-students";

interface UsersDetailProps {
  userId: string;
}

const UsersDetail = ({ userId }: UsersDetailProps) => {
  const { data: student, isLoading } = useStudent({ studentId: userId }) as {
    data: StudentsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student?.data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No user data available
      </div>
    );
  }

  const userData = student.data;

  return (
    <div className=" space-y-5 py-5">
      <h6 className=" pl-6  font-semibold text-lg">User details</h6>
      <Card className=" p-6  space-y-4 bg-[#FCFFF5]">
        {/* <h6 className="    font-semibold text-xl">{userData.fullName}</h6> */}
        <div className=" flex gap-6 ">
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Exams Subscribed"
            amount="10"
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Mock Exams taken"
            amount="100"
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Practice Exams"
            amount="3,456"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4 ">
        <h6 className="text-xl">User Information</h6>
        {/* <CustomTabs
          triggerClassName="data-[state=active]:border-0 text-base  text-gray-400  !font-normal  data-[state=active]:text-black px-0  data-[state=active]:!font-medium "
          tabs={[
            {
              value: "details",
              label: "Details",
              content: <Details student={userData} />,
            },
            {
              value: "exams",
              label: "Exams",
              content: <Exams />,
            },
            {
              value: "mockExams",
              label: "Mock Exams",
              content: <MockExams />,
            },
          ]}
        /> */}
      </Card>
    </div>
  );
};

export default UsersDetail;
