"use client";

import type React from "react";
import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateTutorial,
  createTutorialInputSchema,
  CreateTutorialInput,
} from "@/features/tutorials/api/tutorial/create-tutorial";
import { useAllExamTypes } from "@/features/exams/api/exam-types/get-all-exam-types";

interface AddTutorialDialogProps {
  children: React.ReactNode;
  subjectId?: string;
  onSuccess?: () => void;
}

export function AddTutorialDialog({
  children,
  subjectId,
  onSuccess
}: AddTutorialDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string>("");

  // Fetch exam types with nested subjects
  const { data: examTypesData, isLoading: isLoadingExamTypes } = useAllExamTypes({
    limit: 100,
    queryConfig: {
      enabled: !subjectId, // Only fetch if subjectId is not provided
    },
  });

  const examTypes = examTypesData?.data || [];

  // Get subjects for selected exam type
  const subjects = useMemo(() => {
    if (!selectedExamTypeId) return [];
    const selectedExamType = examTypes.find((et) => et.id === selectedExamTypeId);
    return selectedExamType?.subjects || [];
  }, [selectedExamTypeId, examTypes]);

  const { mutate: createTutorial, isPending } = useCreateTutorial({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Tutorial created successfully");
        setOpen(false);
        form.reset();
        setSelectedExamTypeId("");
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create tutorial");
      },
    },
  });

  const form = useForm<CreateTutorialInput>({
    resolver: zodResolver(createTutorialInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      subjectId: subjectId || "",
      type: "TEXT_TUTORIAL",
    },
  });

  const onSubmit = (data: CreateTutorialInput) => {
    console.log("Form submitted with data:", data);
    createTutorial(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Tutorial
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Exam Type Selector - only show if subjectId not provided */}
          {!subjectId && (
            <Field>
              <FieldLabel>Exam Type *</FieldLabel>
              {isLoadingExamTypes ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select
                  value={selectedExamTypeId}
                  onValueChange={(value) => {
                    setSelectedExamTypeId(value);
                    form.setValue("subjectId", "");
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger>
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
            </Field>
          )}

          {/* Subject Selector - only show if subjectId not provided */}
          {!subjectId && (
            <Controller
              name="subjectId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Subject *</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending || !selectedExamTypeId || subjects.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedExamTypeId
                          ? "Select exam type first"
                          : subjects.length === 0
                            ? "No subjects available"
                            : "Select subject"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          )}

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Tutorial Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Introduction to Algebra"
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
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tutorial Type *</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tutorial type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXT_TUTORIAL">Text Tutorial</SelectItem>
                    <SelectItem value="VIDEO_TUTORIAL">Video Tutorial</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Tutorial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
