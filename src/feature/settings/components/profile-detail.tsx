import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import * as z from "zod";
import { useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/feature/profile/hooks/useProfile";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
  email: z.string(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters.")
    .max(15, "Phone number must be at most 15 characters."),
});

export const ProfileSettingsForm = () => {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      updateProfile.mutate(
        {
          fullName: value.name,
          phone: value.phone,
        },
        {
          onSuccess: () => {
            toast.success("Profile updated successfully!");
          },
          onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Failed to update profile.";
            toast.error(message);
          },
        }
      );
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      form.setFieldValue("name", profile.fullName || "");
      form.setFieldValue("email", profile.email || "");
      form.setFieldValue("phone", profile.phone || "");
    }
  }, [profile, form]);

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-sm">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="w-full">
          {/* Name Field */}
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
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

          {/* Email Field - Disabled */}
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
                    disabled
                    placeholder="sample@email.com"
                    type="email"
                    className="bg-gray-100 cursor-not-allowed opacity-75"
                  />
                  <p className="text-[12px] text-[#6B7280] mt-[8px]">
                    Email cannot be changed. Contact support if you need
                    assistance.
                  </p>
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
                    placeholder="+234 708 076 3214"
                    type="tel"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={updateProfile.isPending || isLoading}
          className="w-full bg-accent hover:bg-accent/80 mt-[32px] text-white text-lg rounded-[8px]"
          title={updateProfile.isPending ? "Saving..." : "Save Changes"}
        />
      </form>
    </div>
  );
};
