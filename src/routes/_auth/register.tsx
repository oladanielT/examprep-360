import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { RegisterForm } from "@/feature/auth/components/register-form";

function RegisterPage() {
  return (
    <section className="">
      <Progress value={50} />
      <div className="relative my-2 flex items-center justify-between">
        <GoBack backTo="/welcome" />

        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo />
        </div>
      </div>

      <div className="flex flex-col gap-5 items-center max-w-md mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-[#101828]">
            Create an account
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
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
