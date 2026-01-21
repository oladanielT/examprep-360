"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUpdateExamType,
  updateExamTypeInputSchema,
  UpdateExamTypeInput,
} from "../api/exam-types/update-exam-types";
import { toast } from "sonner";

interface EditExamDialogProps {
  children: React.ReactNode;
  exam: {
    id: string;
    name: string;
    category: string;
  };
  onSuccess?: () => void;
}

const examCategories = [
  { value: "SECONDARY_SCHOOL", label: "Secondary School" },
  { value: "PRE_DEGREE", label: "Pre Degree" },
  { value: "POST_JAMB", label: "Post Jamb" },
  { value: "UNIVERSITY_COURSE", label: "University Course" },
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "CLASS_TEST", label: "Class Test" },
  { value: "MOCK_EXAM", label: "Mock Exam" },
  { value: "PRACTICE_TEST", label: "Practice Test" },
];

export function EditExamDialog({ children, exam, onSuccess }: EditExamDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateExamTypeInput>({
    resolver: zodResolver(updateExamTypeInputSchema),
    defaultValues: {
      name: exam.name,
      category: exam.category,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: exam.name,
        category: exam.category,
      });
    }
  }, [open, exam, form]);

  const { mutate: updateExamType, isPending } = useUpdateExamType({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Exam type updated successfully");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update exam type");
      },
    },
  });

  const onSubmit = (data: UpdateExamTypeInput) => {
    updateExamType({ data, examTypeId: exam.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Exam Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Exam Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g., WAEC, JAMB, NECO"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-exam-category">Category</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="edit-exam-category" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {examCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-[#BEE74C] hover:bg-[#B0D945] text-black font-medium"
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Update Exam"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
