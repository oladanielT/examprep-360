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
  useUpdateModule,
  updateModuleInputSchema,
  UpdateModuleInput,
} from "@/features/courses/api/module/update-module";

interface EditModuleDialogProps {
  children: React.ReactNode;
  module: {
    id: string;
    name: string;
    courseId: string;
  };
  onSuccess?: () => void;
}

export function EditModuleDialog({
  children,
  module,
  onSuccess,
}: EditModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateModule, isPending } = useUpdateModule({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating module:", error);
      },
    },
  });

  const form = useForm<UpdateModuleInput>({
    resolver: zodResolver(updateModuleInputSchema),
    mode: "onChange",
    defaultValues: {
      name: module.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: module.name });
    }
  }, [open, module.name, form]);

  const onSubmit = (data: UpdateModuleInput) => {
    console.log("Form submitted with data:", data);
    updateModule({ data, moduleId: module.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Module
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
              {isPending ? "Updating..." : "Update Module"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
