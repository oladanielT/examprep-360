

import React from "react";
import { useForm } from "@tanstack/react-form";
import { Copy, Check } from "lucide-react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import * as z from "zod";
import { useState } from "react";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters.")
    .max(15, "Phone number must be at most 15 characters."),
  referralCode: z.string().optional(),
});

export const ProfileSettingsForm = () => {
  const [copied, setCopied] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 708 076 3214",
      referralCode: "REF123ABC456",
    },
    validators: {
      onSubmit: profileSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(form.getFieldValue("referralCode") || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm">
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

          {/* Referral Code Section */}
          <form.Field
            name="referralCode"
            children={(field) => {
              return (
                <div className="border border-[#E5E7EB] rounded-[12px] p-[20px] bg-[#F9FAFB]">
                  <FieldLabel htmlFor="form-referral" className="mb-[12px] block">
                    Referral Code
                  </FieldLabel>
                  <div className="flex items-center gap-[12px]">
                    <div className="flex-1 px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#6B7280] font-medium">
                      {field.state.value}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReferralCode}
                      className="flex items-center justify-center h-[44px] w-[44px] rounded-[8px] bg-accent hover:bg-accent/90 text-white transition-all"
                    >
                      {copied ? (
                        <Check className="h-[20px] w-[20px]" />
                      ) : (
                        <Copy className="h-[20px] w-[20px]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[12px] text-[#6B7280] mt-[8px]">
                    Share this code with friends to earn rewards
                  </p>
                </div>
              );
            }}
          />
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.state.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-[32px] text-white text-lg rounded-[8px]"
          title={form.state.isSubmitting ? "Saving..." : "Save Changes"}
        />
      </form>
    </div>
  );
};
