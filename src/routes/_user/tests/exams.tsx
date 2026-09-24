import { isProfessionalExam } from "@/lib/exam-category";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, ChevronRight } from "lucide-react";
import CustomPageHeader from "@/components/global/custom-page-header";
import Subjects from "@/feature/tests/components/exams/subjects";
import TrialDashboard from "@/feature/tests/components/exams/trial-dashboard";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";
import { findActivePaidSubscription } from "@/lib/subscription-access";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAvailableExams,
  useExamPreferences,
  useProfessionalHierarchy,
} from "@/feature/exams/hooks";

function ExamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: preferences, isLoading, isError } = useExamPreferences();
  const isProfessional = isProfessionalExam(preferences?.examCategory);
  const {
    data: subscriptions,
    isPending: subscriptionsPending,
    isError: subscriptionsError,
  } = useSubscriptions(isProfessional);
  const professionalExamType = preferences?.examTypeId || "";
  const activePaidSubscription = findActivePaidSubscription(
    subscriptions,
    professionalExamType,
  );
  useProfessionalHierarchy(isProfessional ? professionalExamType : "");
  useAvailableExams({ examTypeEnum: "PRACTICE" }, isProfessional);
  useAvailableExams({ examTypeEnum: "MOCK" }, isProfessional);
  const unitLabel = isProfessional ? "Topic" : "Subject";
  const unitLabelPlural = isProfessional ? "Topics/Sections" : "subjects";

  if (isLoading || (isProfessional && subscriptionsPending)) {
    return (
      <div className="">
        <div className="py-6 sm:py-8 space-y-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-full h-12 rounded-xl mt-4" />
        </div>
        <div className="pt-6 sm:pt-8 px-1">
          <div className="flex items-center justify-between gap-4 border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
          </div>
        </div>
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Skeleton className="h-24 w-full rounded-2xl" />
           <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }
  if (isError || !preferences?.examCategory) {
    return <div className="py-10 text-center">Could not load your exam preferences.</div>;
  }
  if (isProfessional && subscriptionsError) {
    return <div className="py-10 text-center">Could not verify your subscription access.</div>;
  }

  return (
    <div className="">
      <CustomPageHeader
        backLink="/tests"
        heading="Take a Test"
        subHeading={isProfessional
          ? "Choose a component and domain to begin practicing"
          : `Pick a ${unitLabel.toLowerCase()} and year`}
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder={`Search ${unitLabelPlural.toLowerCase()}...`}
      />

      {/* Professional simulation is available after paid access is active. */}
      {(!isProfessional || activePaidSubscription) && (
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
      )}

      {/* Trial Dashboard */}
      {isProfessional && !activePaidSubscription && (
        <div className="px-1 pt-6 sm:pt-8">
          <TrialDashboard key={professionalExamType} />
        </div>
      )}

      <Subjects searchQuery={searchQuery} />
    </div>
  );
}

export const Route = createFileRoute("/_user/tests/exams")({
  component: ExamsPage,
});
