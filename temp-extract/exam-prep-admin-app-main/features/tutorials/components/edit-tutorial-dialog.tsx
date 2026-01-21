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
import {
  useUpdateTutorial,
  updateTutorialInputSchema,
  UpdateTutorialInput,
} from "@/features/tutorials/api/tutorial/update-tutorial";

interface EditTutorialDialogProps {
  children: React.ReactNode;
  tutorial: {
    id: string;
    name: string;
    type: "TEXT_TUTORIAL" | "VIDEO_TUTORIAL";
    subjectId: string;
  };
  onSuccess?: () => void;
}

export function EditTutorialDialog({
  children,
  tutorial,
  onSuccess
}: EditTutorialDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateTutorial, isPending } = useUpdateTutorial({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating tutorial:", error);
      },
    },
  });

  const form = useForm<UpdateTutorialInput>({
    resolver: zodResolver(updateTutorialInputSchema),
    mode: "onChange",
    defaultValues: {
      name: tutorial.name,
      type: tutorial.type,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: tutorial.name, type: tutorial.type });
    }
  }, [open, tutorial.name, tutorial.type, form]);

  const onSubmit = (data: UpdateTutorialInput) => {
    console.log("Form submitted with data:", data);
    updateTutorial({ data, tutorialId: tutorial.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Tutorial
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
              {isPending ? "Updating..." : "Update Tutorial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
