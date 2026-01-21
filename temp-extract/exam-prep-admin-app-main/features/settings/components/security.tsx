"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PrimaryButton from "@/components/buttons/primary-button";
import { InputField } from "@/components/custom/custom-form-field";
import { useState } from "react";

// Zod schema with password validation
const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password cannot be the same as current password",
    path: ["newPassword"],
  });

type SecurityFormData = z.infer<typeof securitySchema>;

interface SecurityProps {
  onSubmit?: (data: SecurityFormData) => void | Promise<void>;
}

const Security = ({ onSubmit }: SecurityProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onFormSubmit = async (data: SecurityFormData) => {
    try {
      setIsLoading(true);
      await onSubmit?.(data);
      reset(); // Clear form after successful submission
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-2xl space-y-5">
      {/* Current Password */}
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <InputField
            placeholder="••••••••"
            label="Current password"
            type="password"
            {...field}
            error={errors.currentPassword?.message}
            required
          />
        )}
      />

      {/* New Password */}
      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <InputField
            placeholder="••••••••"
            label="New password"
            type="password"
            {...field}
            error={errors.newPassword?.message}
            required
          />
        )}
      />

      {/* Confirm New Password */}
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <InputField
            placeholder="••••••••"
            label="Confirm new password"
            type="password"
            {...field}
            error={errors.confirmPassword?.message}
            required
          />
        )}
      />

      <PrimaryButton
        title={isLoading ? "Saving..." : "Save changes"}
        type="submit"
        disabled={isLoading}
      />
    </form>
  );
};

export default Security;
