import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { ForgotPasswordForm } from "@/feature/auth/components/forgot-password-form";

function ForgotPasswordPage() {
  return (
    <section className="space-y-5">
      <Progress value={33} />
      <GoBack backTo="/sign-in" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Forgot Password?
          </h2>
          <p className="text-[#667085]">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}

// @ts-ignore - Route will be generated
export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPasswordPage,
});
