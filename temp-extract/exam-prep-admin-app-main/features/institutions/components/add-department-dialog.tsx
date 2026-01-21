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
  useCreateDepartment,
  createDepartmentInputSchema,
  CreateDepartmentInput,
} from "../api/department/create-department";

interface AddDepartmentDialogProps {
  children: React.ReactNode;
  facultyId: string;
  onSuccess?: () => void;
}

export function AddDepartmentDialog({
  children,
  facultyId,
  onSuccess
}: AddDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createDepartment, isPending } = useCreateDepartment({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error creating department:", error);
      },
    },
  });

  const form = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      facultyId: facultyId,
    },
  });

  const onSubmit = (data: CreateDepartmentInput) => {
    console.log("Form submitted with data:", data);
    createDepartment(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Department
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Department Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Department of Physics"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <PrimaryButton
            className="max-w-full"
            title="Add Department"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
