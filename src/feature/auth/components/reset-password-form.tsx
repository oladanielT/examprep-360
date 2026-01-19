import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePasswordResetVerify, usePasswordReset } from "@/feature/auth/hooks/usePasswordReset";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  otp: z.string().min(6, "OTP must be 6 digits.").max(6, "OTP must be 6 digits."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(50, "Password must be at most 50 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ResetPasswordFormProps {
  email?: string;
}

export const ResetPasswordForm = ({ email: initialEmail }: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [step, setStep] = useState<"verify" | "reset">("verify");

  const verifyOtp = usePasswordResetVerify();
  const resetPassword = usePasswordReset();

  const form = useForm({
    defaultValues: {
      email: initialEmail || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setErrorMessage("");
      setSuccessMessage("");

      if (step === "verify") {
        // Step 1: Verify OTP - validate email and OTP only
        const verifySchema = z.object({
          email: z.string().email("Please enter a valid email address."),
          otp: z.string().min(6, "OTP must be 6 digits.").max(6, "OTP must be 6 digits."),
        });

        const result = verifySchema.safeParse(value);
        if (!result.success) {
          setErrorMessage(result.error.errors[0].message);
          return;
        }

        verifyOtp.mutate(
          {
            email: value.email,
            otp: value.otp,
          },
          {
            onSuccess: (data) => {
              setResetToken(data.resetToken);
              setStep("reset");
              setSuccessMessage("OTP verified! Now enter your new password.");
            },
            onError: (error: any) => {
              const message = error?.response?.data?.message || error?.message || "Invalid OTP. Please try again.";
              setErrorMessage(message);
            },
          }
        );
      } else {
        // Step 2: Reset Password - validate all fields including passwords
        const result = resetPasswordSchema.safeParse(value);
        if (!result.success) {
          setErrorMessage(result.error.errors[0].message);
          return;
        }

        resetPassword.mutate(
          {
            email: value.email,
            resetToken: resetToken,
            newPassword: value.newPassword,
          },
          {
            onSuccess: () => {
              setSuccessMessage("Password reset successful! Redirecting to sign in...");
              setTimeout(() => {
                navigate({ to: "/sign-in" });
              }, 2000);
            },
            onError: (error: any) => {
              const message = error?.response?.data?.message || error?.message || "Failed to reset password. Please try again.";
              setErrorMessage(message);
            },
          }
        );
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
          {/* Email Field */}
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="form-email">Email Address</FieldLabel>
                  <InputField
                    id="form-email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="sample@email.com"
                    type="email"
                    autoComplete="off"
                    disabled={!!initialEmail}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* OTP Field */}
          <form.Field
            name="otp"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="form-otp">Verification Code</FieldLabel>
                  <InputField
                    id="form-otp"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter 6-digit code"
                    type="text"
                    maxLength={6}
                    autoComplete="off"
                    disabled={step === "reset"}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* New Password Field - Only show after OTP verified */}
          {step === "reset" && (
            <>
              <form.Field
                name="newPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="form-new-password">New Password</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="form-new-password"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter new password"
                          type={seePassword ? "text" : "password"}
                          autoComplete="off"
                        />
                        <InputGroupAddon>
                          <InputGroupButton
                            type="button"
                            onClick={() => setSeePassword(!seePassword)}
                          >
                            {seePassword ? <EyeClosed /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              {/* Confirm Password Field */}
              <form.Field
                name="confirmPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="form-confirm-password">
                        Confirm Password
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="form-confirm-password"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Confirm new password"
                          type={seeConfirmPassword ? "text" : "password"}
                          autoComplete="off"
                        />
                        <InputGroupAddon>
                          <InputGroupButton
                            type="button"
                            onClick={() => setSeeConfirmPassword(!seeConfirmPassword)}
                          >
                            {seeConfirmPassword ? <EyeClosed /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            disabled={verifyOtp.isPending || resetPassword.isPending}
            title={
              verifyOtp.isPending
                ? "Verifying..."
                : resetPassword.isPending
                ? "Resetting..."
                : step === "verify"
                ? "Verify Code"
                : "Reset Password"
            }
            className="w-full mt-4"
          />

          {/* Back to Sign In */}
          <div className="text-center mt-4">
            <Link
              to="/sign-in"
              className="text-sm text-[#667085] hover:text-[#F04F54] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};
