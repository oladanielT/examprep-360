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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-6 sm:py-10 gap-3 sm:gap-5">
        {isLoading && (
          <div className="col-span-full text-center py-10">Loading...</div>
        )}
        {error && (
          <div className="col-span-full text-center py-10 text-red-500">
            Failed to load exam preferences
          </div>
        )}
        {data && (data.examTypeRecord || data.examSubtype) && (
          <Link
            to="/tests/exams"
            className="bg-[#FFF0B333] rounded-2xl sm:rounded-3xl shadow p-4 sm:p-5 items-center flex border justify-between gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              <img
                src="/img/note.png"
                alt={data.examTypeRecord?.name || data.examSubtype || "Exam"}
                width={1000}
                height={1000}
                className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0"
              />
              <div className="min-w-0">
                <h6 className="text-sm sm:text-lg font-semibold truncate">
                  {data.examTypeRecord?.name || data.examSubtype || "Exam"}
                </h6>
                <p className="font-medium text-[10px] sm:text-xs text-gray-500">
                  {data.subjects?.length || 0} Subjects
                </p>
              </div>
            </div>
            <span className="bg-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow flex-shrink-0">
              <ChevronRight className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </Link>
        )}
        {data && !data.examTypeRecord && !data.examSubtype && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No exam preferences found. Please set up your exam preferences.
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/")({
  component: TestsPage,
});
