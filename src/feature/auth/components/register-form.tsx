import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed, Check, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRequestEmailOtp } from "@/feature/auth/hooks";
import { API_BASE_URL } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters.")
      .max(15, "Phone number must be at most 15 characters."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(50, "Password must be at most 50 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);
  const [isInstitutional, setIsInstitutionalLocal] = useState(false);
  const { setBasicInfo, setIsInstitutional, data } = useRegistrationStore();
  const requestOtpMutation = useRequestEmailOtp();

  const form = useForm({
    defaultValues: {
      name: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Request OTP to be sent to email
        await requestOtpMutation.mutateAsync({ email: value.email });

        // Save to registration store
        setBasicInfo({
          fullName: value.name,
          email: value.email,
          phone: value.phone,
          password: value.password,
        });
        // Set institutional flag based on switch
        setIsInstitutional(isInstitutional);
        // Go to next step: verify email
        navigate({ to: "/verify-email" });
      } catch {
        // Error is handled by the mutation
        toast.error(
          requestOtpMutation.error?.response?.data?.message ||
            "Failed to send verification code. Please try again.",
        );
      }
    },
  });

  return (
    <div className="w-full">
      {/* Institutional License Toggle */}
      <div className="flex items-center justify-between py-2 mb-2 border-b border-gray-100">
        <div className="space-y-0.5">
          <label
            htmlFor="institutional-switch"
            className="text-sm font-medium text-gray-900"
          >
            Institutional License
          </label>
          <p className="text-xs text-gray-500">
            Register multiple students for your school
          </p>
        </div>
        <Switch
          id="institutional-switch"
          checked={isInstitutional}
          onCheckedChange={setIsInstitutionalLocal}
        />
      </div>

      {/* Google Sign Up Button */}
      <PrimaryButton
        className="w-full hover:bg-gray-200 text-lg bg-transparent border text-gray-800 border-gray-300"
        title="Continue"
        onClick={() => {
          // Save institutional flag before redirecting to Google OAuth
          setIsInstitutional(isInstitutional);
          window.location.href = `${API_BASE_URL}${AUTH_ENDPOINTS.GOOGLE_OAUTH}?platform=web`;
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_794_20378)">
              <path
                d="M19.8052 10.2312C19.8052 9.55141 19.7501 8.86797 19.6325 8.19922H10.2002V12.05H15.6016C15.3775 13.292 14.6573 14.3907 13.6027 15.0888V17.5874H16.8252C18.7176 15.8457 19.8052 13.2736 19.8052 10.2312Z"
                fill="#4285F4"
              />
              <path
                d="M10.1999 19.9998C12.897 19.9998 15.1714 19.1143 16.8286 17.5857L13.6061 15.0871C12.7096 15.697 11.5521 16.0424 10.2036 16.0424C7.59474 16.0424 5.38272 14.2824 4.58904 11.916H1.26367V14.4918C2.96127 17.8686 6.41892 19.9998 10.1999 19.9998Z"
                fill="#34A853"
              />
              <path
                d="M4.58564 11.9163C4.16676 10.6743 4.16676 9.32947 4.58564 8.0875V5.51172H1.26395C-0.154389 8.33737 -0.154389 11.6664 1.26395 14.4921L4.58564 11.9163Z"
                fill="#FBBC04"
              />
              <path
                d="M10.1999 3.95805C11.6256 3.936 13.0035 4.47247 14.036 5.45722L16.8911 2.60218C15.0833 0.904587 12.6838 -0.0287217 10.1999 0.000673888C6.41892 0.000673888 2.96126 2.13185 1.26367 5.51234L4.58537 8.08813C5.37537 5.71811 7.59106 3.95805 10.1999 3.95805Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_794_20378">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>Sign Up With Google</span>
        </div>
      </PrimaryButton>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">
            or sign up with email
          </span>
        </div>
      </div>

      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {/* Name Field — full width */}
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid} className="sm:col-span-2">
                  <FieldLabel htmlFor="form-name">Full Name</FieldLabel>

                  <InputField
                    id="form-name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. Sayo Makinwa"
                    autoComplete="off"
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

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

          {/* Phone Field */}
          <form.Field
            name="phone"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="form-phone">Phone Number</FieldLabel>

                  <InputField
                    id="form-phone"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="+23470 **** ****"
                    type="tel"
                    autoComplete="off"
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Password + Confirm Password */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {/* Password Field */}
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                const pwd = field.state.value;

                const rules = [
                  {
                    label: "At least 8 characters",
                    met: pwd.length >= 8,
                  },
                  {
                    label: "Uppercase letter (A-Z)",
                    met: /[A-Z]/.test(pwd),
                  },
                  {
                    label: "Lowercase letter (a-z)",
                    met: /[a-z]/.test(pwd),
                  },
                  {
                    label: "Number (0-9)",
                    met: /[0-9]/.test(pwd),
                  },
                  {
                    label: "Symbol (!@#$...)",
                    met: /[^A-Za-z0-9]/.test(pwd),
                  },
                ];

                const metCount = rules.filter((r) => r.met).length;
                const strengthPercent = (metCount / rules.length) * 100;

                const strengthColor =
                  metCount <= 1
                    ? "bg-red-500"
                    : metCount <= 3
                      ? "bg-yellow-500"
                      : metCount <= 4
                        ? "bg-blue-500"
                        : "bg-green-500";

                const strengthLabel =
                  metCount <= 1
                    ? "Weak"
                    : metCount <= 3
                      ? "Fair"
                      : metCount <= 4
                        ? "Good"
                        : "Strong";

                return (
                  <>
                    {/* Password */}
                    <Field
                      data-invalid={isInvalid}
                      className="sm:col-start-1 sm:row-start-1"
                    >
                      <FieldLabel htmlFor="form-password">Password</FieldLabel>

                      <InputGroup className="h-10 rounded-4xl">
                        <InputGroupInput
                          id="form-password"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type={seePassword ? "text" : "password"}
                          placeholder="••••••••"
                          aria-invalid={isInvalid}
                        />

                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            aria-label="Toggle password visibility"
                            title="Toggle password visibility"
                            size="icon-xs"
                            onClick={() => setSeePassword(!seePassword)}
                          >
                            {seePassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeClosed className="h-4 w-4" />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>

                    {/* Password Strength + Rules */}
                    {pwd.length > 0 && (
                      <div className="sm:col-span-2 sm:col-start-1 sm:row-start-2 space-y-2">
                        {/* Strength Bar */}
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                              style={{
                                width: `${strengthPercent}%`,
                              }}
                            />
                          </div>

                          <span
                            className={`shrink-0 text-xs font-medium ${strengthColor.replace(
                              "bg-",
                              "text-",
                            )}`}
                          >
                            {strengthLabel}
                          </span>
                        </div>

                        {/* Password Rules */}
                        <ul className="grid gap-x-2 gap-y-1 grid-cols-2 sm:grid-cols-3">
                          {rules.map((rule) => (
                            <li
                              key={rule.label}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              {rule.met ? (
                                <Check className="h-3 w-3 shrink-0 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 shrink-0 text-gray-300" />
                              )}

                              <span
                                className={
                                  rule.met ? "text-green-600" : "text-gray-400"
                                }
                              >
                                {rule.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <form.Field
                      name="confirmPassword"
                      children={(confirmField) => {
                        const isConfirmInvalid =
                          confirmField.state.meta.isTouched &&
                          !confirmField.state.meta.isValid;

                        return (
                          <Field
                            data-invalid={isConfirmInvalid}
                            className="sm:col-start-2 sm:row-start-1"
                          >
                            <FieldLabel htmlFor="form-confirm-password">
                              Confirm Password
                            </FieldLabel>

                            <InputGroup className="h-10 rounded-4xl">
                              <InputGroupInput
                                id="form-confirm-password"
                                name={confirmField.name}
                                value={confirmField.state.value}
                                onBlur={confirmField.handleBlur}
                                onChange={(e) =>
                                  confirmField.handleChange(e.target.value)
                                }
                                type={seeConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                aria-invalid={isConfirmInvalid}
                              />

                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  type="button"
                                  aria-label="Toggle password visibility"
                                  title="Toggle password visibility"
                                  size="icon-xs"
                                  onClick={() =>
                                    setSeeConfirmPassword(!seeConfirmPassword)
                                  }
                                >
                                  {seeConfirmPassword ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeClosed className="h-4 w-4" />
                                  )}
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>

                            {isConfirmInvalid && (
                              <FieldError
                                errors={confirmField.state.meta.errors}
                              />
                            )}
                          </Field>
                        );
                      }}
                    />
                  </>
                );
              }}
            />
          </div>
        </FieldGroup>

        {/* Submit Button */}
        <PrimaryButton
          type="submit"
          disabled={form.state.isSubmitting || requestOtpMutation.isPending}
          className="w-full bg-accent hover:bg-accent/80 mt-4 text-white text-lg disabled:opacity-50"
          title={requestOtpMutation.isPending ? "Sending code..." : "Continue"}
        />
      </form>
      <p className="text-center mt-3 font-medium">
        Have an account?{" "}
        <Link to="/sign-in" className="text-accent">
          Sign In
        </Link>
      </p>
    </div>
  );
};
