import React from "react";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { SelectExamForm } from "@/feature/auth/components/select-exam-form";

export default function SelectExamPage() {
  return (
    <section className="space-y-5">
      <Progress value={33} />
      <GoBack backTo="/welcome" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Kindly pick the exams you’re preparing for
          </h2>
        </div>
        <SelectExamForm />
      </div>
    </section>
  );
}
