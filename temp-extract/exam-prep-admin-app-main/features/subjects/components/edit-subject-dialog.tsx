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
import PrimaryButton from "@/components/buttons/primary-button";
import { toast } from "sonner";
import {
  useUpdateSubject,
  updateSubjectInputSchema,
  UpdateSubjectInput,
} from "../api/subject/update-subject";
import { Subject } from "../api/subject/get-subjects";

interface EditSubjectDialogProps {
  children: React.ReactNode;
  subject: Subject;
  onSuccess?: () => void;
}

export function EditSubjectDialog({
  children,
  subject,
  onSuccess
}: EditSubjectDialogProps) {
  const [open, setOpen] = useState(false);

  const { mutate: updateSubject, isPending } = useUpdateSubject({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Subject updated successfully");
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update subject");
      },
    },
  });

  const form = useForm<UpdateSubjectInput>({
    resolver: zodResolver(updateSubjectInputSchema),
    mode: "onChange",
    defaultValues: {
      name: subject.name,
    },
  });

  // Reset form when dialog opens with current subject data
  useEffect(() => {
    if (open) {
      form.reset({
        name: subject.name,
      });
    }
  }, [open, form, subject.name]);

  const onSubmit = (data: UpdateSubjectInput) => {
    updateSubject({ data, subjectId: subject.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Subject
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

          <PrimaryButton
            className="max-w-full"
            title="Update Subject"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
