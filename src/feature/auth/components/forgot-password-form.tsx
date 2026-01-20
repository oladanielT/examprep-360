import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { usePasswordResetRequest } from "@/feature/auth/hooks/usePasswordReset";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const resetRequest = usePasswordResetRequest();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage("");
      resetRequest.mutate(
        { email: value.email },
        {
          onSuccess: (data) => {
            setErrorMessage("");
            const message = data?.message || "Reset code sent! Check your email.";
            toast.success(message);
            // Navigate to reset password page with email after a brief delay
            setTimeout(() => {
              // @ts-ignore - Route will be available after routes are generated
              navigate({
                to: "/reset-password",
                search: { email: value.email }
              });
            }, 1500);
          },
          onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Failed to send reset code. Please try again.";
            setErrorMessage(message);
          },
        }
      );
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
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            disabled={resetRequest.isPending}
            title={resetRequest.isPending ? "Sending..." : "Send Reset Code"}
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
