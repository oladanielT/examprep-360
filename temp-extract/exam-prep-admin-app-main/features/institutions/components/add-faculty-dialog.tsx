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
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  useCreateFaculty,
  createFacultyInputSchema,
  CreateFacultyInput,
} from "../api/faculty/create-faculty";

interface AddFacultyDialogProps {
  children: React.ReactNode;
  universityId: string;
  onSuccess?: () => void;
}

export function AddFacultyDialog({
  children,
  universityId,
  onSuccess
}: AddFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createFaculty, isPending } = useCreateFaculty({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error creating faculty:", error);
      },
    },
  });

  const form = useForm<CreateFacultyInput>({
    resolver: zodResolver(createFacultyInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      universityId: universityId,
    },
  });

  const onSubmit = (data: CreateFacultyInput) => {
    console.log("Form submitted with data:", data);
    createFaculty({ data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Faculty
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Faculty Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Faculty of Science"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <PrimaryButton
            className="max-w-full"
            title="Add Faculty"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
