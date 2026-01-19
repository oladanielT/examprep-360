import { createFileRoute, Link } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { ChevronRight, Loader2 } from "lucide-react";
import { useAvailableExams } from "@/feature/exams/hooks/useExams";

function TestsIndexPage() {
  const { data, isLoading, error } = useAvailableExams();

  return (
    <div className="">
      <CustomPageHeader
        backLink="/"
        heading="Take a Test"
        subHeading="Pick an Exam you"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-destructive">Failed to load exams. Please try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 py-10 gap-5">
          {data?.exams && data.exams.length > 0 ? (
            data.exams.map((exam) => (
              <Link
                key={exam.id}
                to="/tests/exams"
                search={{ examId: exam.id }}
                className="bg-[#FFF0B333] rounded-3xl shadow p-5 items-center flex border justify-between"
              >
                <div className="flex items-center gap-5">
                  <img
                    src="/img/note.png"
                    alt="note"
                    width={1000}
                    height={1000}
                    className="w-14 h-14"
                  />
                  <div>
                    <h6 className="text-lg font-semibold">{exam.title || exam.subjectName}</h6>
                    <p className="font-medium text-xs">{exam.questionCount} Questions</p>
                  </div>
                </div>
                <span className="bg-white w-10 h-10 flex items-center justify-center rounded-full shadow">
                  <ChevronRight className="text-green-400" />
                </span>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-muted-foreground">
              No exams available at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/")({
  component: TestsIndexPage,
});
