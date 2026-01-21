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
import PrimaryButton from "@/components/buttons/primary-button";
import {
  useCreateCourse,
  createCourseInputSchema,
  CreateCourseInput,
} from "@/features/courses/api/course/create-course";
import { useUniversities } from "@/features/institutions/api/university/get-universities";
import { useFaculties } from "@/features/institutions/api/faculty/get-faculties";
import { useDepartments } from "@/features/institutions/api/department/get-deparments";

interface AddCourseDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AddCourseDialog({
  children,
  onSuccess
}: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<"UNIVERSITY" | "COLLEGE" | "POLYTECHNIC">("UNIVERSITY");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  const { data: universitiesData, isLoading: isLoadingUniversities } = useUniversities({
    limit: 100,
  });

  // Filter universities by selected institution type (client-side)
  const filteredUniversities = universitiesData?.data.filter(
    (university) => university.type === selectedInstitutionType
  ) || [];

  const { data: facultiesData, isLoading: isLoadingFaculties } = useFaculties({
    universityId: selectedUniversityId,
    limit: 100,
    queryConfig: {
      enabled: !!selectedUniversityId,
    },
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments({
    facultyId: selectedFacultyId,
    limit: 100,
    queryConfig: {
      enabled: !!selectedFacultyId,
    },
  });

  const { mutate: createCourse, isPending } = useCreateCourse({
    mutationConfig: {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setSelectedInstitutionType("UNIVERSITY");
        setSelectedUniversityId("");
        setSelectedFacultyId("");
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error creating course:", error);
      },
    },
  });

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      level: 100,
      departmentId: "",
    },
  });

  const onSubmit = (data: CreateCourseInput) => {
    console.log("Form submitted with data:", data);
    createCourse(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl text-center font-semibold">
            Add New Course
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Institution Type Filter */}
          <Field>
            <FieldLabel>Institution Type *</FieldLabel>
            <Select
              value={selectedInstitutionType}
              onValueChange={(value) => {
                setSelectedInstitutionType(value as "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC");
                setSelectedUniversityId("");
                setSelectedFacultyId("");
                form.setValue("departmentId", "");
              }}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select institution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIVERSITY">University</SelectItem>
                <SelectItem value="COLLEGE">College</SelectItem>
                <SelectItem value="POLYTECHNIC">Polytechnic</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Institution Selector */}
          <Field>
            <FieldLabel>Institution *</FieldLabel>
            <Select
              value={selectedUniversityId}
              onValueChange={(value) => {
                setSelectedUniversityId(value);
                setSelectedFacultyId("");
                form.setValue("departmentId", "");
              }}
              disabled={isPending || isLoadingUniversities}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an institution" />
              </SelectTrigger>
              <SelectContent>
                {filteredUniversities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Faculty Selector */}
          <Field>
            <FieldLabel>Faculty *</FieldLabel>
            <Select
              value={selectedFacultyId}
              onValueChange={(value) => {
                setSelectedFacultyId(value);
                form.setValue("departmentId", "");
              }}
              disabled={isPending || !selectedUniversityId || isLoadingFaculties}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a faculty" />
              </SelectTrigger>
              <SelectContent>
                {facultiesData?.data.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Department Selector */}
          <Controller
            name="departmentId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Department *</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending || !selectedFacultyId || isLoadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsData?.data.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Course Name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Introduction to Computer Science"
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
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="code">Course Code *</FieldLabel>
                <Input
                  id="code"
                  placeholder="e.g., CSC101"
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
            name="level"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="level">Level *</FieldLabel>
                <Input
                  id="level"
                  type="number"
                  placeholder="e.g., 100, 200, 300"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isPending}
                />
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
            <PrimaryButton
              type="submit"
              title="Create Course"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Course"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
