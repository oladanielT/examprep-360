import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { SigninForm } from "@/feature/auth/components/sign-in-form";

function SignInPage() {
  return (
    <section className="space-y-5">
      <Progress value={33} />
      <GoBack backTo="/welcome" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#101828]">
            Welcome
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
            Welcome back! Please enter your details.
          </p>
        </div>
        <SigninForm />
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/sign-in")({
  component: SignInPage,
});
