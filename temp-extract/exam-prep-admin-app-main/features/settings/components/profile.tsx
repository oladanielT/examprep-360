"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PrimaryButton from "@/components/buttons/primary-button";
import { InputField } from "@/components/custom/custom-form-field";
import { Pencil } from "lucide-react";
import { useState } from "react";

// Zod schema
const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileProps {
  initialData?: {
    fullName: string;
    email: string;
  };
  onSubmit?: (data: ProfileFormData) => void | Promise<void>;
}

const Profile = ({ initialData, onSubmit }: ProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
    },
  });

  const onFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      await onSubmit?.(data);

      reset(data); // Reset dirty state but keep the new values
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 w-2xl">
      {/* Full Name */}
      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <InputField
            icon={<Pencil className="text-black absolute right-5 h-3 top-10" />}
            placeholder="Enter full name"
            containerClassName="flex relative flex-col w-full"
            label="Full name"
            {...field}
            error={errors.fullName?.message}
            required
          />
        )}
      />

      {/* Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            placeholder="Enter email address"
            containerClassName="flex relative flex-col w-full"
            label="Email address"
            type="email"
            {...field}
            error={errors.email?.message}
            required
          />
        )}
      />

      <PrimaryButton
        title={isLoading ? "Saving..." : "Save changes"}
        type="submit"
        disabled={isLoading || !isDirty}
      />
    </form>
  );
};

export default Profile;
