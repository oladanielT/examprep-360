import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { SelectExamForm } from "@/feature/auth/components/select-exam-form";

function SelectExamPage() {
  return (
    <section className="space-y-5">
      <Progress value={80} />
      <GoBack backTo="/verify-email" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Select Your Exam
          </h2>
          <p className="text-[#667085]">
            Choose the exam you're preparing for.
          </p>
        </div>
        <SelectExamForm />
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/select-exam")({
  component: SelectExamPage,
});
