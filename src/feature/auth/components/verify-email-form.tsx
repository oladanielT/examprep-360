

import React from "react";
import { useForm } from "@tanstack/react-form";
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
import { Link, useNavigate } from "@tanstack/react-router";

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export const VerifyEmailForm = () => {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Do something with the form values.
        console.log("OTP submitted:", value.otp);
        // TODO: Add your verification API call here
        // const response = await verifyOTP(value.otp);

        // Navigate to select exam page
        navigate({ to: "/select-exam" });
      } catch (error) {
        console.error("Verification failed:", error);
      }
    },
  });

  return (
    <div className="w-full">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="w-full">
          {/* OTP Field */}
          <form.Field
            name="otp"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="text-[#6D6D6D]" htmlFor="form-otp">
                    Enter OTP
                  </FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={form.state.isSubmitting}
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.state.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title={form.state.isSubmitting ? "Verifying..." : "Continue"}
        />
      </form>

      <p className="text-center mt-7 font-medium text-sm">
        Didn't get a code?{" "}
        <button
          type="button"
          className="text-accent hover:underline font-medium"
          onClick={() => {
            // TODO: Implement resend OTP logic
            console.log("Resend OTP");
          }}
        >
          Resend Code
        </button>
      </p>
    </div>
  );
};
