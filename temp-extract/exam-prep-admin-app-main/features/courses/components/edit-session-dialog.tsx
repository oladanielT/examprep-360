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
  useUpdateSession,
  updateSessionInputSchema,
  UpdateSessionInput,
} from "@/features/courses/api/session/update-session";

interface EditSessionDialogProps {
  children: React.ReactNode;
  session: {
    id: string;
    year: string;
    moduleId: string;
  };
  onSuccess?: () => void;
}

export function EditSessionDialog({
  children,
  session,
  onSuccess,
}: EditSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateSession, isPending } = useUpdateSession({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating session:", error);
      },
    },
  });

  const form = useForm<UpdateSessionInput>({
    resolver: zodResolver(updateSessionInputSchema),
    mode: "onChange",
    defaultValues: {
      year: session.year,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ year: session.year });
    }
  }, [open, session.year, form]);

  const onSubmit = (data: UpdateSessionInput) => {
    console.log("Form submitted with data:", data);
    updateSession({ data, sessionId: session.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Session
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
              {isPending ? "Updating..." : "Update Session"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
