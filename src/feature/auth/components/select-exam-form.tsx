import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import PrimaryButton from "@/components/buttons/primary-button";
import * as z from "zod";
import { CustomSelect } from "@/components/custom/custom-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useExamTypes, useExamSubjects } from "@/feature/exams/hooks";
import { Loader2 } from "lucide-react";

// Max subjects allowed per exam type
function getMaxSubjects(examType: string): number {
  const normalized = examType.toLowerCase();
  // Post-UTME: students pick a single subject. Checked before JAMB/UTME
  // since "Post-UTME" also matches "utme".
  if (normalized.includes("post")) {
    return 1;
  }
  if (normalized.includes("jamb") || normalized.includes("utme")) {
    return 4;
  }
  return 9; // WAEC, NECO, etc.
}

const selectExamSchema = z.object({
  examType: z.string().min(1, "Please select an exam type"),
  subjects: z
    .array(z.string())
    .min(1, "Please select at least one subject"),
  students: z.array(z.number()).optional(),
});


export const SelectExamForm = () => {
  const navigate = useNavigate();
  const { setExamSelection, data } = useRegistrationStore();
  const isInstitutional = data.isInstitutional;
  const category = data.category;

  // Track selected exam type in state for fetching subjects
  const [selectedExamType, setSelectedExamType] = useState(data.examType || "");
  const [selectedExamTypeId, setSelectedExamTypeId] = useState(data.examTypeId || "");

  // Fetch exam types based on selected category
  const {
    data: examTypes,
    isLoading: isLoadingExamTypes
  } = useExamTypes(category);

  // Fetch subjects based on selected exam type
  const {
    data: subjects,
    isLoading: isLoadingSubjects
  } = useExamSubjects(selectedExamType);

  const form = useForm({
    defaultValues: {
      examType: data.examType || "",
      subjects: data.subjects || ([] as string[]),
      students: [data.students || 4] as number[],
    },
    onSubmit: async ({ value }) => {
      // Validate
      const max = getMaxSubjects(value.examType);
      const schema = selectExamSchema.refine(
        (data) => data.subjects.length <= max,
        { message: `You can select maximum ${max} subjects`, path: ["subjects"] }
      );
      const result = schema.safeParse(value);
      if (!result.success) {
        return;
      }
      // Save to registration store (no duration/plan selection here)
      setExamSelection({
        examType: value.examType,
        examTypeId: selectedExamTypeId,
        duration: "", // Will be selected at checkout if paying
        subjects: value.subjects,
        students: isInstitutional && value.students ? value.students[0] : 1,
      });
      // Navigate to summary page
      navigate({ to: "/summary" });
    },
  });

  const maxSubjects = getMaxSubjects(selectedExamType);

  // Transform exam types for select (use name as both label and value)
  const examTypeOptions = examTypes?.map((type) => ({
    label: type.name,
    value: type.name,
  })) || [];

  return (
    <div className="w-full">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="w-full">
          {/* Exam Type */}
          <form.Field
            name="examType"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="text-[#6D6D6D] uppercase text-[12px]"
                    htmlFor="form-exam-type"
                  >
                    Exam Type
                  </FieldLabel>
                  {isLoadingExamTypes ? (
                    <div className="flex items-center gap-2 h-14 px-4 border rounded-4xl">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-500">Loading exam types...</span>
                    </div>
                  ) : (
                    <CustomSelect
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        // Find the selected exam type to get its ID
                        const selected = examTypes?.find((type) => type.name === value);
                        // Update local state for subject fetching
                        setSelectedExamType(value);
                        setSelectedExamTypeId(selected?.id || "");
                        // Clear subjects when exam type changes
                        form.setFieldValue("subjects", []);
                      }}
                      options={examTypeOptions}
                      placeholder="Choose an exam type"
                      required
                    />
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Subjects */}
          <form.Field
            name="subjects"
            mode="array"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="text-[#6D6D6D] uppercase text-[12px]"
                    htmlFor="form-subjects"
                  >
                    Subjects
                  </FieldLabel>

                  {!selectedExamType ? (
                    <p className="text-sm text-gray-500 py-4">
                      Please select an exam type first
                    </p>
                  ) : isLoadingSubjects ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-500">Loading subjects...</span>
                    </div>
                  ) : subjects && subjects.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Please select your subjects (up to {maxSubjects})
                      </p>
                      <ToggleGroup
                        multiple={true}
                        value={field.state.value}
                        onValueChange={(newValue) => {
                          // Single-subject exams (e.g. Post-UTME): replace
                          // the selection instead of blocking the new pick.
                          if (maxSubjects === 1) {
                            field.handleChange(newValue.slice(-1));
                          } else if (newValue.length <= maxSubjects) {
                            field.handleChange(newValue);
                          }
                        }}
                        className="flex flex-wrap gap-3"
                      >
                        {subjects.map((subject) => {
                          const isSelected = field.state.value.includes(subject.id);
                          // When only one subject is allowed, keep all options
                          // clickable so the pick can be swapped.
                          const isDisabled =
                            maxSubjects > 1 && !isSelected && field.state.value.length >= maxSubjects;
                          return (
                            <ToggleGroupItem
                              key={subject.id}
                              value={subject.id}
                              disabled={isDisabled}
                              className={cn(
                                "h-auto min-h-[56px] py-3 px-4 !rounded-sm border-2",
                                "flex items-center justify-center",
                                "text-xs font-medium text-center whitespace-nowrap",
                                "transition-all duration-200",
                                "hover:border-accent hover:bg-accent/5",
                                "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                                isSelected
                                  ? "border-accent"
                                  : "border-[#E5E5E5] text-black",
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                              aria-label={subject.name}
                            >
                              {subject.name}
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>

                      {field.state.value.length > 0 && (
                        <div className="mt-3 text-xs text-[#6B7280]">
                          Selected: {field.state.value.length} / {maxSubjects}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 py-4">
                      No subjects available for this exam type
                    </p>
                  )}

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {isInstitutional && (
            <form.Field
              name="students"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel className="text-[#6D6D6D] uppercase text-xs">
                        Number of Students
                      </FieldLabel>
                      <span className="text-[14px] font-semibold text-accent">
                        {field.state.value[0]} Students
                      </span>
                    </div>
                    <Slider
                      min={2}
                      max={500}
                      step={1}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(Array.isArray(value) ? value : [value])
                      }
                      className="w-full"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          )}
        </FieldGroup>

        <PrimaryButton
          type="submit"
          disabled={form.state.isSubmitting || isLoadingExamTypes}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title={form.state.isSubmitting ? "Loading..." : "Continue"}
        />
      </form>
    </div>
  );
};
