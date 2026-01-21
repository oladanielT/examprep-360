"use client";

import React, { useState } from "react";
import { AddNewButton } from "@/components/buttons/add-new-button";
import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { useRouter } from "next/navigation";
import { paths } from "@/config/paths";

interface TabSubjectQuestionContentProps {
  subjectId: string;
}

const TabSubjectQuestionContent = ({ subjectId }: TabSubjectQuestionContentProps) => {
  const router = useRouter();
  const [hasQuestions] = useState(false); // TODO: Fetch from API

  const handleAddNew = () => {
    router.push(paths.app.subjects.getQuestionEditorHref(subjectId, "new"));
  };

  const handleSeeAll = () => {
    router.push(paths.app.subjects.getQuestionEditorHref(subjectId, "all"));
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Add New Question Card */}
      <div onClick={handleAddNew} className="cursor-pointer min-h-[140px]">
        <AddNewButton label="Add New Question" />
      </div>

      {/* See All Questions Card - Only show if there are questions */}
      {hasQuestions && (
        <div onClick={handleSeeAll} className="cursor-pointer">
          <SmallStatsCard
            amountClassName="text-lg"
            title="QUESTIONS"
            amount="See All"
            containerClassName="min-h-[140px]"
            showMenu={false}
          />
        </div>
      )}
    </div>
  );
};

export default TabSubjectQuestionContent;
