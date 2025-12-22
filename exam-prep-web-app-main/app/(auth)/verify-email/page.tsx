import React from "react";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import { VerifyEmailForm } from "@/feature/auth/components/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <section className="space-y-5">
      <Progress value={33} />
      <GoBack backTo="/welcome" />
      <div className="flex flex-col gap-10 items-center mt-5 max-w-md mx-auto">
        <Logo />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter text-[#101828]">
            Verify Your Email Address
          </h2>
          <p className="text-[#667085]">
            We sent an OTP to *****Fg@gmail.com, kindly enter the OTP to verify
            your email address
          </p>
        </div>
        <VerifyEmailForm />
      </div>
    </section>
  );
}
