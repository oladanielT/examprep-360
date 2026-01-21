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
  useUpdateFaculty,
  updateFacultyInputSchema,
  UpdateFacultyInput,
} from "../api/faculty/update-faculty";

interface EditFacultyDialogProps {
  children: React.ReactNode;
  faculty: {
    id: string;
    name: string;
    universityId: string;
  };
  onSuccess?: () => void;
}

export function EditFacultyDialog({
  children,
  faculty,
  onSuccess
}: EditFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateFaculty, isPending } = useUpdateFaculty({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating faculty:", error);
      },
    },
  });

  const form = useForm<UpdateFacultyInput>({
    resolver: zodResolver(updateFacultyInputSchema),
    mode: "onChange",
    defaultValues: {
      name: faculty.name,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: faculty.name });
    }
  }, [open, faculty.name, form]);

  const onSubmit = (data: UpdateFacultyInput) => {
    console.log("Form submitted with data:", data);
    updateFaculty({ data, facultyId: faculty.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Faculty
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
            title="Update Faculty"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
