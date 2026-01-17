import { createFileRoute, Link } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { ChevronRight } from "lucide-react";
import { useExamPreferences } from "@/feature/exams/hooks";

function TestsPage() {
  const { data, isLoading, error } = useExamPreferences();

  return (
    <div className="">
      <CustomPageHeader
        backLink="/"
        heading="Take a Test"
        subHeading="Pick an Exam"
      />
      <div className="grid grid-cols-3 py-10 gap-5">
        {isLoading && (
          <div className="col-span-3 text-center py-10">Loading...</div>
        )}
        {error && (
          <div className="col-span-3 text-center py-10 text-red-500">
            Failed to load exam preferences
          </div>
        )}
        {data && (
          <Link
            to="/tests/exams"
            className="bg-[#FFF0B333] rounded-3xl shadow p-5 items-center flex border justify-between"
          >
            <div className="flex items-center gap-5">
              <img
                src="/img/note.png"
                alt={data.examTypeRecord.name}
                width={1000}
                height={1000}
                className="w-14 h-14"
              />
              <div>
                <h6 className="text-lg font-semibold">{data.examTypeRecord.name}</h6>
                <p className="font-medium text-xs">
                  {data.subjects.length} Subjects
                </p>
              </div>
            </div>
            <span className="bg-white w-10 h-10 flex items-center justify-center rounded-full shadow">
              <ChevronRight className="text-green-400" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/")({
  component: TestsPage,
});
