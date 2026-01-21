import { SmallStatsCard } from '@/components/cards/small-stats-card';
import { Card } from '@/components/ui/card';
import React from 'react'

const MockExams = () => {
 return (
    <div className="    gap-5 grid grid-cols-3">
      <SmallStatsCard
        containerClassName=" "
        className=" w-full"
        amountClassName=" text-lg"
        title="6 Subjects"
        amount="WAEC EXAM"
      >
        {" "}
        <Card className=" flex-row w-fit gap-2 items-center rounded-sm p-1 text-sm bg-[#EFEFEF]">
          <span>50/100</span>{" "}
          <div className="w-2 h-2  rounded-full bg-sidebar-primary" />{" "}
          <span>Jan 13th, 2025</span>
        </Card>{" "}
      </SmallStatsCard>
      <SmallStatsCard
        containerClassName=" "
        className=" w-full"
        amountClassName=" text-lg"
        title="6 Subjects"
        amount="WAEC EXAM"
      >
        {" "}
        <Card className=" flex-row w-fit gap-2 items-center rounded-sm p-1 text-sm bg-[#EFEFEF]">
          <span>50/100</span>{" "}
          <div className="w-2 h-2  rounded-full bg-sidebar-primary" />{" "}
          <span>Jan 13th, 2025</span>
        </Card>{" "}
      </SmallStatsCard>
      <SmallStatsCard
        containerClassName=" "
        className=" w-full"
        amountClassName=" text-lg"
        title="6 Subjects"
        amount="WAEC EXAM"
      >
        {" "}
        <Card className=" flex-row w-fit gap-2 items-center rounded-sm p-1 text-sm bg-[#EFEFEF]">
          <span>50/100</span>{" "}
          <div className="w-2 h-2  rounded-full bg-sidebar-primary" />{" "}
          <span>Jan 13th, 2025</span>
        </Card>{" "}
      </SmallStatsCard>
    </div>
  );
}

export default MockExams