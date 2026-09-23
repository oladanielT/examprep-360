import { useExamPreferences } from "@/feature/exams/hooks";
import { isProfessionalExam } from "@/lib/exam-category";
import AcademicTrialBanner from "./academic-trial-banner";
import ProfessionalTrialBanner from "./professional-trial-banner";

export default function FreeTrialBanner() {
  const { data: preferences, isLoading, isError } = useExamPreferences();
  if (isLoading || isError || !preferences?.examCategory) return null;
  return isProfessionalExam(preferences.examCategory)
    ? <ProfessionalTrialBanner key={preferences.examTypeId} />
    : <AcademicTrialBanner key={preferences.examTypeId} />;
}



