import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { VerifyEmailForm } from "@/feature/auth/components/verify-email-form";

function VerifyEmailPage() {
  return (
    <section className="space-y-5">
      <Progress value={60} />
      <GoBack backTo="/register" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-[#101828]">
            Verify Your Email
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
            We've sent a verification code to your email.
          </p>
        </div>
        <VerifyEmailForm />
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/verify-email")({
  component: VerifyEmailPage,
});
