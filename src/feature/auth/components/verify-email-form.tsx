import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert } from "@/components/ui/alert";
import * as z from "zod";
import { useNavigate } from "@tanstack/react-router";
import { useVerifyEmail, useResendVerification } from "@/feature/auth/hooks";
import { useRegistrationStore } from "@/stores/registrationStore";

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain only numbers."),
});

export const VerifyEmailForm = () => {
  const navigate = useNavigate();
  const { data: registrationData } = useRegistrationStore();
  const email = registrationData.email;
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  useEffect(() => {
    // Redirect to register if no email in registration store
    if (!email) {
      navigate({ to: "/register" });
    }
  }, [email, navigate]);

  const form = useForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await verifyMutation.mutateAsync({
          email,
          otp: value.otp,
        });
        // Navigate to select exam page
        navigate({ to: "/select-exam" });
      } catch {
        // Error is handled by the mutation
      }
    },
  });

  const handleResendCode = async () => {
    if (email) {
      try {
        await resendMutation.mutateAsync({ email });
      } catch {
        // Error is handled by the mutation
      }
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="w-full">
      <p className="text-center text-sm text-gray-600 mb-6">
        We sent a verification code to <span className="font-medium">{email}</span>
      </p>

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

        {verifyMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            {verifyMutation.error?.response?.data?.message ||
              "Verification failed. Please check your code."}
          </Alert>
        )}

        {resendMutation.isSuccess && (
          <Alert className="mt-4">
            Verification code sent successfully!
          </Alert>
        )}

        {resendMutation.isError && (
          <Alert variant="destructive" className="mt-4">
            {resendMutation.error?.response?.data?.message ||
              "Failed to resend code. Please try again."}
          </Alert>
        )}

        <PrimaryButton
          type="submit"
          disabled={verifyMutation.isPending}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg disabled:opacity-50"
          title={verifyMutation.isPending ? "Verifying..." : "Continue"}
        />
      </form>

      <p className="text-center mt-7 font-medium text-sm">
        Didn't get a code?{" "}
        <button
          type="button"
          className="text-accent hover:underline font-medium disabled:opacity-50"
          disabled={resendMutation.isPending}
          onClick={handleResendCode}
        >
          {resendMutation.isPending ? "Sending..." : "Resend Code"}
        </button>
      </p>
    </div>
  );
};
