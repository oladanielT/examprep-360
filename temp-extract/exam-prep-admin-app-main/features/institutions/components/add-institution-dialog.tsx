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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schoolTypes } from "@/lib/placehoder-data";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  useCreateUniversity,
  createUniversityInputSchema,
  CreateUniversityInput,
} from "../api/university/create-university";

interface AddInstitutionDialogProps {
  children: React.ReactNode;
}

export function AddInstitutionDialog({ children }: AddInstitutionDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createUniversity, isPending } = useCreateUniversity({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating university:", error);
      },
    },
  });

  const form = useForm<CreateUniversityInput>({
    resolver: zodResolver(createUniversityInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      acronym: "",
      type: "UNIVERSITY",
      imageUrl: "",
    },
  });

  const onSubmit = (data: CreateUniversityInput) => {
    console.log("Form submitted with data:", data);
    createUniversity({ data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl  text-center font-semibold">
            Add New Higher Institution
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
                <FieldLabel htmlFor="add-university-type">School Type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="add-university-type"
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

          {/* Upload commented out for now */}
          {/* <DropzoneField
            label="Upload a picture"
            required
            accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif"] }}
            maxSize={1024 * 1024}
          /> */}

          <PrimaryButton
            className="max-w-full"
            title="Add Higher Institution"
            type="submit"
            loading={isPending}
            disabled={isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
