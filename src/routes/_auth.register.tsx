import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { RegisterForm } from "@/feature/auth/components/register-form";

function RegisterPage() {
  return (
    <section className="space-y-5">
      <Progress value={50} />
      <GoBack backTo="/welcome" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Create an account
          </h2>
          <p className="text-[#667085]">
            Get started with your exam preparation journey.
          </p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
});
