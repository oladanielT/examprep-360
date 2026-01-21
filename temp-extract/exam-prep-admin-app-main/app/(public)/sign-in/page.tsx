"use client";

import React from "react";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import { PublicGuard } from "@/components/guards";
import { paths } from "@/config/paths";

import { useLogin } from "@/lib/auth";

// ========== VALIDATION SCHEMA ==========
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

// ========== SIGN IN PAGE COMPONENT ==========
const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);

  // ========== FORM SETUP ==========
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ========== AUTH MUTATION ==========
  const loginMutation = useLogin({
    onSuccess: () => {
      toast.success("Welcome back! Signing you in...");

      const redirectTo =
        searchParams.get("redirectTo") || paths.app.dashboard.getHref();
      router.push(redirectTo);
    },
    onError: (error) => {
      console.error("Login error:", error);

      // Additional handling for specific error codes
      if (error.statusCode === 401) {
        // Invalid credentials - user sees the message from API
        toast.error(error.message || "Invalid email or password");
      } else if (error.statusCode === 429) {
        // Too many attempts
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.statusCode === 500) {
        // Server error
        toast.error("Server error. Please try again later.");
      }
    },
  });

  // ========== FORM SUBMISSION ==========
  const onSubmit = (data: SignInFormData) => {
    // ✅ Mutation handles all error handling and token storage
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  // ========== RENDER ==========
  return (
    <PublicGuard>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* ========== HEADER SECTION ========== */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sidebar-primary/10 mb-4">
              <GraduationCap className="w-8 h-8 text-sidebar-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>

          {/* ========== SIGN IN FORM ========== */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              {/* ========== EMAIL FIELD ========== */}
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <InputField
                      label="Email Address"
                      type="email"
                      placeholder="admin@example.com"
                      {...field}
                      error={fieldState.error?.message}
                      required
                      disabled={isSubmitting || loginMutation.isPending}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                    />
                  </div>
                )}
              />

              {/* ========== PASSWORD FIELD ========== */}
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="relative">
                    <InputField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      error={fieldState.error?.message}
                      required
                      disabled={isSubmitting || loginMutation.isPending}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      disabled={isSubmitting || loginMutation.isPending}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
              />

              {/* ========== ERROR DISPLAY ========== */}
              {loginMutation.isError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {loginMutation.error?.message}
                  </p>
                </div>
              )}

              {/* ========== SUBMIT BUTTON ========== */}
              <PrimaryButton
                type="submit"
                title={loginMutation.isPending ? "Signing in..." : "Sign In"}
                disabled={isSubmitting || loginMutation.isPending || !isValid}
                className="mt-8 w-full max-w-md"
                aria-busy={loginMutation.isPending}
              />
            </form>
          </div>
        </div>
      </div>
    </PublicGuard>
  );
};

export default SignInPage;
