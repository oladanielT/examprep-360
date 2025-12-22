import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Check } from "lucide-react";

function SummaryPage() {
  const navigate = useNavigate();

  return (
    <section className="space-y-5">
      <Progress value={100} />
      <GoBack backTo="/select-exam" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Registration Complete!
          </h2>
          <p className="text-[#667085]">
            Your account has been successfully created. Let's get started with your exam preparation journey.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <PrimaryButton
            onClick={() => navigate({ to: "/" })}
            className="w-full bg-accent hover:bg-accent/80 text-white text-lg"
            title="Go to Dashboard"
          />
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/summary")({
  component: SummaryPage,
});
