"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import PrimaryButton from "@/components/buttons/primary-button";
import * as z from "zod";
import { CustomSelect } from "@/components/custom/custom-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const verifyEmailSchema = z.object({
  examType: z.string().min(1, "Please select an exam type"),
  duration: z.string().min(1, "Please select a duration"),
  subjects: z
    .array(z.string())
    .min(1, "Please select at least one subject")
    .max(3, "You can select maximum 3 subjects"),
  students: z
    .array(z.number())
    .length(1, "Please set study hours")
    .refine((val) => val[0] >= 2 && val[0] <= 200, {
      message: "Study hours must be between 2 and 200",
    }),
});

const examTypes = [
  { label: "JAMB", value: "jamb" },
  { label: "WAEC", value: "waec" },
  { label: "NECO", value: "neco" },
  { label: "Post-UTME", value: "post-utme" },
  { label: "GCE", value: "gce" },
];

const durations = [
  { label: "30 Days", value: "30" },
  { label: "60 Days", value: "60" },
  { label: "120 Days", value: "120" },
  { label: "180 Days", value: "180" },
];

export const subjects = [
  { id: "english", label: "English Language" },
  { id: "mathematics", label: "Mathematics" },
  { id: "civic", label: "Civic Education" },
  { id: "biology", label: "Biology" },
  { id: "chemistry", label: "Chemistry" },
  { id: "literature", label: "Literature" },
  { id: "physics", label: "Physics" },
  { id: "geography", label: "Geography" },
];

export const SelectExamForm = () => {
  const form = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      examType: "",
      duration: "",
      subjects: [],
      students: [4],
    },
  });

  async function onSubmit(data: z.infer<typeof verifyEmailSchema>) {
    try {
      console.log("Form submitted:", data);
      // TODO: Add your API call here
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  }

  return (
    <div className="w-full">
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="w-full">
          {/* Duration */}
          <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="text-[#6D6D6D] uppercase text-[12px]"
                  htmlFor="form-duration"
                >
                  Duration
                </FieldLabel>
                <CustomSelect
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={durations}
                  placeholder="Choose duration"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Exam Type */}
          <Controller
            name="examType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="text-[#6D6D6D] uppercase text-[12px]"
                  htmlFor="form-exam-type"
                >
                  Exam Type
                </FieldLabel>
                <CustomSelect
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={examTypes}
                  placeholder="Choose an exam type"
                  required
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="subjects"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="text-[#6D6D6D] uppercase text-[12px]"
                  htmlFor="form-exam-type"
                >
                  Subjects
                </FieldLabel>
                <ToggleGroup
                  type="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 sm:grid-cols-3  gap-3 sm:gap-4"
                >
                  {subjects.map((subject) => (
                    <ToggleGroupItem
                      key={subject.id}
                      value={subject.id}
                      className={cn(
                        "h-auto py-4 px-3 rounded-sm border-2",
                        "flex flex-col items-center justify-center gap-2",
                        "text-xs font-medium text-center",
                        "transition-all duration-200",
                        "hover:border-accent hover:bg-accent/5",
                        "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                        field.value.includes(subject.id)
                          ? "border-accent"
                          : "border-[#E5E5E5] text-black"
                      )}
                      aria-label={subject.label}
                    >
                      <span className="max-w-20 wrap-break-word whitespace-normal ">
                        {subject.label}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}

                {field.value.length > 0 && (
                  <div className="mt-3 text-xs text-[#6B7280]">
                    Selected: {field.value.length}/ {subjects.length}
                  </div>
                )}
              </Field>
            )}
          />

          <Controller
            name="students"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel className="text-[#6D6D6D] uppercase text-xs">
                    Number of Students
                  </FieldLabel>
                  <span className="text-[14px] font-semibold text-accent">
                    {field.value[0]} Students
                  </span>
                </div>
                <Slider
                  min={2}
                  max={500}
                  step={1}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="w-full"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title={form.formState.isSubmitting ? "Loading..." : "Continue"}
        />
      </form>
    </div>
  );
};
