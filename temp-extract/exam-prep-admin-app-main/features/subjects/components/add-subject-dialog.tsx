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
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrimaryButton from "@/components/buttons/primary-button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useCreateSubject,
  createSubjectInputSchema,
  CreateSubjectInput,
} from "../api/subject/create-subject";
import { useAllExamTypes, ExamTypesResponse } from "@/features/exams/api/exam-types/get-all-exam-types";

interface AddSubjectDialogProps {
  children: React.ReactNode;
  examTypeId?: string;
  onSuccess?: () => void;
}

export function AddSubjectDialog({
  children,
  examTypeId,
  onSuccess
}: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);

  // Fetch exam types if examTypeId is not provided
  const { data: examTypesData, isLoading: isLoadingExamTypes } = useAllExamTypes({
    limit: 100,
    queryConfig: {
      enabled: !examTypeId, // Only fetch if examTypeId is not provided
    },
  }) as { data: ExamTypesResponse | undefined; isLoading: boolean };

  const examTypes = examTypesData?.data || [];

  const { mutate: createSubject, isPending } = useCreateSubject({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Subject created successfully");
        setOpen(false);
        form.reset();
        onSuccess?.(); // Call optional callback if provided
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create subject");
      },
    },
  });

  const form = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      examTypeId: examTypeId || "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        examTypeId: examTypeId || "",
      });
    }
  }, [open, form, examTypeId]);

  const onSubmit = (data: CreateSubjectInput) => {
    createSubject({ data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Subject
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Subject Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g., Mathematics"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Only show exam type selector if examTypeId is not provided */}
          {!examTypeId && (
            <Controller
              name="examTypeId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Exam Type</FieldLabel>
                  {isLoadingExamTypes ? (
                    <div className="flex items-center justify-center h-10 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {examTypes.map((examType) => (
                          <SelectItem key={examType.id} value={examType.id}>
                            {examType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <PrimaryButton
            className="max-w-full"
            title="Add Subject"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
