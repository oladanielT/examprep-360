"use client";

import type React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputField } from "@/components/custom/custom-form-field";
import { CustomSelect } from "@/components/custom/custom-select";
import PrimaryButton from "@/components/buttons/primary-button";

interface AddNewAdminDialogProps {
  children: React.ReactNode;
  onSubmit?: (data: AdminFormData) => void | Promise<void>;
}

// School type options
const SCHOOL_TYPE_OPTIONS = [
  { value: "olevel", label: "O-Level" },
  { value: "uni", label: "University" },
];

// Exam options
const EXAM_OPTIONS = [
  { value: "waec", label: "WAEC" },
  { value: "neco", label: "NECO" },
  { value: "jamb", label: "JAMB" },
  { value: "utme", label: "Post-UTME" },
];

// Subject options
const SUBJECT_OPTIONS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "english", label: "English Language" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "literature", label: "Literature in English" },
];

// Year options for O-Level
const YEAR_OPTIONS = [
  { value: "ss1", label: "SS1" },
  { value: "ss2", label: "SS2" },
  { value: "ss3", label: "SS3" },
];

// Course options for University
const COURSE_OPTIONS = [
  { value: "computer_science", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "medicine", label: "Medicine" },
  { value: "law", label: "Law" },
  { value: "business", label: "Business Administration" },
];

// Level options for University
const LEVEL_OPTIONS = [
  { value: "100", label: "100 Level" },
  { value: "200", label: "200 Level" },
  { value: "300", label: "300 Level" },
  { value: "400", label: "400 Level" },
];

// Admin role options
const ADMIN_ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "sales_rep", label: "Sales Rep" },
  { value: "examiner", label: "Examiner" },
];

// Zod schema
export const adminFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    schoolType: z.enum(["olevel", "uni"], {
      message: "School type is required",
    }),
    // O-Level specific fields
    exam: z.string().optional(),
    subject: z.string().optional(),
    year: z.string().optional(),
    // University specific fields
    course: z.string().optional(),
    level: z.string().optional(),
    // Admin role
    adminRole: z.enum(["super_admin", "admin", "sales_rep", "examiner"], {
      message: "Admin role is required",
    }),
  })
  .superRefine((data, ctx) => {
    // Validate O-Level specific fields
    if (data.schoolType === "olevel") {
      if (!data.exam || data.exam.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exam"],
          message: "Exam is required for O-Level",
        });
      }

      if (!data.subject || data.subject.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subject"],
          message: "Subject is required for O-Level",
        });
      }

      if (!data.year || data.year.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["year"],
          message: "Year is required for O-Level",
        });
      }
    }

    // Validate University specific fields
    if (data.schoolType === "uni") {
      if (!data.course || data.course.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["course"],
          message: "Course is required for University",
        });
      }

      if (!data.level || data.level.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["level"],
          message: "Level is required for University",
        });
      }
    }
  });

export type AdminFormData = z.infer<typeof adminFormSchema>;

export function AddNewAdminDialog({
  children,
  onSubmit,
}: AddNewAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      schoolType: "olevel",
      exam: "",
      subject: "",
      year: "",
      course: "",
      level: "",
      adminRole: "admin",
    },
  });

  const schoolType = watch("schoolType");

  const onFormSubmit = async (data: AdminFormData) => {
    try {
      setIsLoading(true);
      await onSubmit?.(data);
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="absolute left-1/2 -translate-x-1/2">
              <DialogTitle className="text-xl font-semibold">
                Add New Admin
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 pt-6">
          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputField
                placeholder="e.g., Samuel Taylor"
                label="Name"
                {...field}
                error={errors.name?.message}
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
                placeholder="e.g., taylor@gmail.com"
                label="Email"
                type="email"
                {...field}
                error={errors.email?.message}
                required
              />
            )}
          />

          {/* School Type */}
          <Controller
            name="schoolType"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="School Type"
                placeholder="Select school type"
                options={SCHOOL_TYPE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.schoolType?.message}
              />
            )}
          />

          {/* O-Level Specific Fields */}
          {schoolType === "olevel" && (
            <>
              <Controller
                name="exam"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Select Exam"
                    placeholder="WAEC"
                    options={EXAM_OPTIONS}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    error={errors.exam?.message}
                  />
                )}
              />

              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Select Subject"
                    placeholder="Maths"
                    options={SUBJECT_OPTIONS}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    error={errors.subject?.message}
                  />
                )}
              />

              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Select Year"
                    placeholder="Select year"
                    options={YEAR_OPTIONS}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    error={errors.year?.message}
                  />
                )}
              />
            </>
          )}

          {/* University Specific Fields */}
          {schoolType === "uni" && (
            <>
              <Controller
                name="course"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Select Course"
                    placeholder="Select course"
                    options={COURSE_OPTIONS}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    error={errors.course?.message}
                  />
                )}
              />

              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label="Select Level"
                    placeholder="Select level"
                    options={LEVEL_OPTIONS}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    error={errors.level?.message}
                  />
                )}
              />
            </>
          )}

          {/* Admin Role */}
          <Controller
            name="adminRole"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="Assign Role"
                placeholder="Select admin role"
                options={ADMIN_ROLE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.adminRole?.message}
              />
            )}
          />

          <PrimaryButton
            title={isLoading ? "Adding Admin..." : "Add Admin"}
            type="submit"
            disabled={isLoading}
            className="max-w-full"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
