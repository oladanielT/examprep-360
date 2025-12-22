"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 708 076 3214",
      referralCode: "REF123ABC456",
    },
  });

  function onSubmit(data: z.infer<typeof profileSchema>) {
    console.log(data);
  }

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(form.getValues("referralCode") || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-sm">
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="w-full">
          {/* Name Field */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-name">Full Name</FieldLabel>
                <InputField
                  {...field}
                  id="form-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Sayo Makinwa"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Email Field - Disabled */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-email">Email Address</FieldLabel>
                <InputField
                  {...field}
                  id="form-email"
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
            )}
          />

          {/* Phone Field */}
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-phone">Phone Number</FieldLabel>
                <InputField
                  {...field}
                  id="form-phone"
                  aria-invalid={fieldState.invalid}
                  placeholder="+234 708 076 3214"
                  type="tel"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Referral Code Section */}
          <div className="border border-[#E5E7EB] rounded-[12px] p-[20px] bg-[#F9FAFB]">
            <FieldLabel htmlFor="form-referral" className="mb-[12px] block">
              Referral Code
            </FieldLabel>
            <div className="flex items-center gap-[12px]">
              <div className="flex-1 px-[16px] py-[12px] bg-white border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#6B7280] font-medium">
                {form.watch("referralCode")}
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
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-[32px] text-white text-lg rounded-[8px]"
          title={form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        />
      </form>
    </div>
  );
};
