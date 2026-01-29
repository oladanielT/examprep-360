import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { ResetPasswordForm } from "@/feature/auth/components/reset-password-form";

const resetPasswordSearchSchema = z.object({
  email: z.string().optional(),
});

function ResetPasswordPage() {
  // @ts-ignore - Route will be available after generation
  const { email } = Route.useSearch();

  return (
    <section className="space-y-5">
      <Progress value={66} />
      <GoBack backTo="/forgot-password" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-[#101828]">
            Reset Password
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
            Enter the code sent to your email and your new password.
          </p>
        </div>
        <ResetPasswordForm email={email} />
      </div>
    </section>
  );
}

// @ts-ignore - Route will be generated
export const Route = createFileRoute("/_auth/reset-password")({
  component: ResetPasswordPage,
  validateSearch: resetPasswordSearchSchema,
});
