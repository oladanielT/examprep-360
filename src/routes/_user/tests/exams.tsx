import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, ChevronRight } from "lucide-react";
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

      {/* Exam Simulation Banner */}
      <div className="pt-6 sm:pt-8 px-1">
        <Link
          to="/mock-exam/setup"
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#F04F54]/10 to-orange-50 border border-[#F04F54]/20 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F04F54] flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Exam Simulation
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Combine multiple subjects into one timed session — just like the real exam
              </p>
            </div>
          </div>
          <span className="bg-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow shrink-0 group-hover:shadow-md transition-shadow">
            <ChevronRight className="text-[#F04F54] w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </Link>
      </div>

      <Subjects searchQuery={searchQuery} />
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/exams")({
  component: ExamsPage,
});
