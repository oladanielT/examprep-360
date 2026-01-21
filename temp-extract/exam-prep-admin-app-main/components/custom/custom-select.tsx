import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  options: SelectOption[] | SelectGroupOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  label?: string;
  error?: string;
  required?: boolean;
  grouped?: boolean;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  label,
  error,
  required = false,
  grouped = false,
}: CustomSelectProps) {
  return (
    <div className={cn("w-full flex flex-col  space-y-2", className)}>
      {label && (
        <label className="  tracking-[3px]  text-xs uppercase text-gray-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "w-full",
            error && "border-rose-500 focus:ring-rose-500","rounded-4xl flex px-5  !h-14",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={cn("max-h-[300px]", contentClassName)}>
          {grouped
            ? // Render grouped options
            (options as SelectGroupOption[]).map((group, idx) => (
              <SelectGroup key={idx}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
            : // Render flat options
            (options as SelectOption[]).map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

// ===========================================
// FILE: lib/select-options.ts
// Global options for exam management system
// ===========================================

// export const examTypes = [
//   { label: "JAMB", value: "jamb" },
//   { label: "WAEC", value: "waec" },
//   { label: "NECO", value: "neco" },
//   { label: "Post-UTME", value: "post-utme" },
//   { label: "GCE", value: "gce" },
// ];

// Grouped example for faculties
// export const facultiesGrouped = [
//   {
//     label: "Sciences",
//     options: [
//       { label: "Computer Science", value: "cs" },
//       { label: "Mathematics", value: "math" },
//       { label: "Physics", value: "physics" },
//       { label: "Chemistry", value: "chemistry" },
//     ],
//   },
//   {
//     label: "Arts",
//     options: [
//       { label: "English", value: "english" },
//       { label: "History", value: "history" },
//       { label: "Philosophy", value: "philosophy" },
//     ],
//   },
//   {
//     label: "Engineering",
//     options: [
//       { label: "Civil Engineering", value: "civil" },
//       { label: "Mechanical Engineering", value: "mechanical" },
//       { label: "Electrical Engineering", value: "electrical" },
//     ],
//   },
// ];

// ===========================================
// USAGE EXAMPLES
// ===========================================

/* 
// Example 1: Basic Select
import { CustomSelect } from "@/components/ui/custom-select"
import { examTypes } from "@/lib/select-options"

<CustomSelect
  options={examTypes}
  value={selectedExam}
  onValueChange={setSelectedExam}
  placeholder="Select exam type"
  label="Exam Type"
  required
/>


// Example 2: Select with Error
<CustomSelect
  options={examStatus}
  value={status}
  onValueChange={setStatus}
  placeholder="Select status"
  label="Exam Status"
  error={errors.status}
  required
/>


// Example 3: Grouped Select (Faculties)
<CustomSelect
  options={facultiesGrouped}
  value={faculty}
  onValueChange={setFaculty}
  placeholder="Select faculty"
  label="Faculty"
  grouped
  required
/>


// Example 4: React Hook Form Integration
import { useForm } from "react-hook-form"

const { control, watch, setValue } = useForm()
const examType = watch("examType")

<CustomSelect
  options={examTypes}
  value={examType}
  onValueChange={(value) => setValue("examType", value)}
  placeholder="Select exam type"
  label="Exam Type"
  required
/>
*/
