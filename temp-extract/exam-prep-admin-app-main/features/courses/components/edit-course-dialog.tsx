"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  useUpdateCourse,
  updateCourseInputSchema,
  UpdateCourseInput,
} from "@/features/courses/api/course/update-course";

interface EditCourseDialogProps {
  children: React.ReactNode;
  course: {
    id: string;
    name: string;
    code: string;
    level: number;
    departmentId: string;
  };
  onSuccess?: () => void;
}

export function EditCourseDialog({
  children,
  course,
  onSuccess,
}: EditCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateCourse, isPending } = useUpdateCourse({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating course:", error);
      },
    },
  });

  const form = useForm<UpdateCourseInput>({
    resolver: zodResolver(updateCourseInputSchema),
    mode: "onChange",
    defaultValues: {
      name: course.name,
      code: course.code,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: course.name, code: course.code });
    }
  }, [open, course.name, course.code, form]);

  const onSubmit = (data: UpdateCourseInput) => {
    console.log("Form submitted with data:", data);
    updateCourse({ data, courseId: course.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Course
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Course Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Introduction to Computer Science"
                  {...field}
                  disabled={isPending}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="code">Course Code *</FieldLabel>
                <Input
                  id="code"
                  placeholder="e.g., CSC101"
                  {...field}
                  disabled={isPending}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <div className="flex gap-3 pt-4">
            <PrimaryButton
              type="button"
              title=""
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              title=""
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Update Course"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
