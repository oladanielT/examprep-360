import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import Subjects from "@/feature/tests/components/exams/subjects";

function ExamsPage() {
  return (
    <div className="">
      <CustomPageHeader
        backLink="/tests"
        filter={true}
        heading="Take a Test"
        subHeading="Pick a subject and year"
      />
      <Subjects />
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/exams")({
  component: ExamsPage,
});
