"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import * as z from "zod";
import Link from "next/link";

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export const VerifyEmailForm = () => {
  const form = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof verifyEmailSchema>) {
    try {
      // Do something with the form values.
      console.log("OTP submitted:", data.otp);
      // TODO: Add your verification API call here
      // const response = await verifyOTP(data.otp);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  return (
    <div className="w-full">
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="w-full">
          {/* OTP Field */}
          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-[#6D6D6D]" htmlFor="form-otp">
                  Enter OTP
                </FieldLabel>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={0}
                    />
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={1}
                    />
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={2}
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={3}
                    />
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={4}
                    />
                    <InputOTPSlot
                      className="w-[56px] h-[56px] text-[24px]"
                      index={5}
                    />
                  </InputOTPGroup>
                </InputOTP>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title={form.formState.isSubmitting ? "Verifying..." : "Continue"}
        />
      </form>

      <p className="text-center mt-7 font-medium text-sm">
        Didn't get a code?{" "}
        <Link href="/sign-up" className="text-accent hover:underline">
          Resend Code
        </Link>
      </p>
    </div>
  );
};
