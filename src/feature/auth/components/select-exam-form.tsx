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

const selectExamSchema = z.object({
  examType: z.string().min(1, "Please select an exam type"),
  duration: z.string().min(1, "Please select a duration"),
  subjects: z
    .array(z.string())
    .min(1, "Please select at least one subject")
    .max(9, "You can select maximum 9 subjects"),
  students: z.array(z.number()).optional(),
});

const examTypes = [
  { label: "JAMB", value: "jamb" },
  { label: "WAEC", value: "waec" },
  { label: "NECO", value: "neco" },
  { label: "Post-UTME", value: "post-utme" },
  { label: "GCE", value: "gce" },
];

const durations = [
  { label: "30 Days", value: "30" },
  { label: "60 Days", value: "60" },
  { label: "120 Days", value: "120" },
  { label: "180 Days", value: "180" },
];

export const subjects = [
  { id: "english", label: "English Language" },
  { id: "mathematics", label: "Mathematics" },
  { id: "civic", label: "Civic Education" },
  { id: "biology", label: "Biology" },
  { id: "chemistry", label: "Chemistry" },
  { id: "literature", label: "Literature" },
  { id: "physics", label: "Physics" },
  { id: "geography", label: "Geography" },
];

export const SelectExamForm = () => {
  const navigate = useNavigate();
  const { setExamSelection, data } = useRegistrationStore();
  const isInstitutional = data.isInstitutional;

  const form = useForm({
    defaultValues: {
      examType: data.examType || "",
      duration: data.duration || "",
      subjects: data.subjects || ([] as string[]),
      students: [data.students || 4],
    },
    validators: {
      onSubmit: selectExamSchema,
    },
    onSubmit: async ({ value }) => {
      // Save to registration store
      setExamSelection({
        examType: value.examType,
        duration: value.duration,
        subjects: value.subjects,
        students: isInstitutional && value.students ? value.students[0] : 1,
      });
      // Navigate to summary page
      navigate({ to: "/summary" });
    },
  });

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
          {/* Duration */}
          <form.Field
            name="duration"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="text-[#6D6D6D] uppercase text-[12px]"
                    htmlFor="form-duration"
                  >
                    Duration
                  </FieldLabel>
                  <CustomSelect
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    options={durations}
                    placeholder="Choose duration"
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

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
                  <CustomSelect
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    options={examTypes}
                    placeholder="Choose an exam type"
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

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
                    htmlFor="form-exam-type"
                  >
                    Subjects
                  </FieldLabel>
                  <ToggleGroup
                    multiple={true}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    className="grid grid-cols-2 sm:grid-cols-3  gap-3 sm:gap-4"
                  >
                    {subjects.map((subject) => (
                      <ToggleGroupItem
                        key={subject.id}
                        value={subject.id}
                        className={cn(
                          "h-auto py-4 px-3 !rounded-sm border-2",
                          "flex items-center justify-center",
                          "text-xs font-medium text-center",
                          "transition-all duration-200",
                          "hover:border-accent hover:bg-accent/5",
                          "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                          field.state.value.includes(subject.id)
                            ? "border-accent"
                            : "border-[#E5E5E5] text-black"
                        )}
                        aria-label={subject.label}
                      >
                        <span className="whitespace-nowrap">
                          {subject.label}
                        </span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}

                  {field.state.value.length > 0 && (
                    <div className="mt-3 text-xs text-[#6B7280]">
                      Selected: {field.state.value.length}/ {subjects.length}
                    </div>
                  )}
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
          disabled={form.state.isSubmitting}
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title={form.state.isSubmitting ? "Loading..." : "Continue"}
        />
      </form>
    </div>
  );
};
