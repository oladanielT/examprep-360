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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrimaryButton from "@/components/buttons/primary-button";
import { schoolTypes } from "@/lib/placehoder-data";
import {
  useUpdateUniversity,
  updateUniversityInputSchema,
  UpdateUniversityInput,
} from "../api/university/update-university";

interface EditUniversityDialogProps {
  children: React.ReactNode;
  university: {
    id: string;
    name: string;
    acronym: string;
    type: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
    imageUrl?: string | null;
  };
  onSuccess?: () => void;
}

export function EditUniversityDialog({
  children,
  university,
  onSuccess
}: EditUniversityDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: updateUniversity, isPending } = useUpdateUniversity({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating university:", error);
      },
    },
  });

  const form = useForm<UpdateUniversityInput>({
    resolver: zodResolver(updateUniversityInputSchema),
    mode: "onChange",
    defaultValues: {
      name: university.name,
      acronym: university.acronym,
      type: university.type,
      imageUrl: university.imageUrl || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: university.name,
        acronym: university.acronym,
        type: university.type,
        imageUrl: university.imageUrl || "",
      });
    }
  }, [open, university, form]);

  const onSubmit = (data: UpdateUniversityInput) => {
    console.log("Form submitted with data:", data);
    updateUniversity({ data, universityId: university.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Edit Higher Institution
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Higher Institution Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="University of Lagos"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="acronym"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Acronym</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="UNILAG"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-university-type">School Type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="edit-university-type"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned">
                    {schoolTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <PrimaryButton
            className="max-w-full"
            title="Update Institution"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
