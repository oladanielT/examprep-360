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
import {
  useUpdateDepartment,
  updateDepartmentInputSchema,
  UpdateDepartmentInput,
} from "../api/department/update-department";

interface EditDepartmentDialogProps {
  children: React.ReactNode;
  department: {
    id: string;
    name: string;
    facultyId: string;
  };
  onSuccess?: () => void;
}

export function EditDepartmentDialog({
  children,
  department,
  onSuccess
}: EditDepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateDepartment, isPending } = useUpdateDepartment({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating department:", error);
      },
    },
  });

  const form = useForm<UpdateDepartmentInput>({
    resolver: zodResolver(updateDepartmentInputSchema),
    mode: "onChange",
    defaultValues: {
      name: department.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: department.name });
    }
  }, [open, department.name, form]);

  const onSubmit = (data: UpdateDepartmentInput) => {
    console.log("Form submitted with data:", data);
    updateDepartment({ data, departmentId: department.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Department
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
            title="Update Department"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
