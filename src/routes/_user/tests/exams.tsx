import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import Subjects from "@/feature/tests/components/exams/subjects";

function ExamsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="">
      <CustomPageHeader
        backLink="/tests"
        heading="Take a Test"
        subHeading="Pick a subject and year"
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search subjects..."
      />
      <Subjects searchQuery={searchQuery} />
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/exams")({
  component: ExamsPage,
});
