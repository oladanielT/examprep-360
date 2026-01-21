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
  useCreateSession,
  createSessionInputSchema,
  CreateSessionInput,
} from "@/features/courses/api/session/create-session";

interface AddSessionDialogProps {
  children: React.ReactNode;
  moduleId: string;
  onSuccess?: () => void;
}

export function AddSessionDialog({
  children,
  moduleId,
  onSuccess,
}: AddSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createSession, isPending } = useCreateSession({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error creating session:", error);
      },
    },
  });

  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionInputSchema),
    mode: "onChange",
    defaultValues: {
      year: "",
      moduleId: moduleId,
    },
  });

  const onSubmit = (data: CreateSessionInput) => {
    console.log("Form submitted with data:", data);
    createSession(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Session
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="year">Academic Year *</FieldLabel>
                <Input
                  id="year"
                  placeholder="e.g., 2023/2024"
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
              {isPending ? "Creating..." : "Create Session"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
