"use client";

import type React from "react";
import { useState } from "react";
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
  useCreateModule,
  createModuleInputSchema,
  CreateModuleInput,
} from "@/features/courses/api/module/create-module";

interface AddModuleDialogProps {
  children: React.ReactNode;
  courseId: string;
  onSuccess?: () => void;
}

export function AddModuleDialog({
  children,
  courseId,
  onSuccess,
}: AddModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createModule, isPending } = useCreateModule({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error creating module:", error);
      },
    },
  });

  const form = useForm<CreateModuleInput>({
    resolver: zodResolver(createModuleInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      courseId: courseId,
    },
  });

  const onSubmit = (data: CreateModuleInput) => {
    console.log("Form submitted with data:", data);
    createModule(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Module
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Module Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Programming Fundamentals"
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
              {isPending ? "Creating..." : "Create Module"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
