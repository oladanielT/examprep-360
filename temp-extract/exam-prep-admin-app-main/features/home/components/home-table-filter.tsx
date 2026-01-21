"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import {
  coursesTypes,
  examTypes,
  schoolTypes,
  statusTypes,
} from "@/lib/placehoder-data";
import { useHomeFilters } from "../lib/home-url-state";

// ============ VALIDATION SCHEMA ============
const filterSchema = z
  .object({
    schoolType: z.string().optional(),
    examType: z.string().optional(),
    course: z.string().optional(),
    status: z.string().optional(),
    dateFrom: z.date().nullable().optional(),
    dateTo: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // If both dates are provided, ensure dateFrom is before dateTo
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["dateTo"],
    }
  );

type FilterFormValues = z.infer<typeof filterSchema>;

// ============ COMPONENT ============
interface FilterDialogProps {
  children: React.ReactNode;
}

export function FilterDialog({ children }: FilterDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [dateExpanded, setDateExpanded] = React.useState(false);

  // Get filters from URL
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useHomeFilters();

  // Setup form
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      schoolType: filters.schoolType || undefined,
      examType: filters.examType || undefined,
      course: filters.course || undefined,
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    },
  });

  // Sync form when URL changes (browser back/forward)
  useEffect(() => {
    form.reset({
      schoolType: filters.schoolType || undefined,
      examType: filters.examType || undefined,
      course: filters.course || undefined,
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    });
  }, [filters, form]);

  // When form is submitted
  const onSubmit = (data: FilterFormValues) => {
    // Update URL with new filters (only include non-empty values)
    updateFilters({
      schoolType: data.schoolType || null,
      examType: data.examType || null,
      course: data.course || null,
      status: data.status || null,
      dateFrom: data.dateFrom || null,
      dateTo: data.dateTo || null,
    });
    setOpen(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    clearFilters();
    form.reset({
      schoolType: undefined,
      examType: undefined,
      course: undefined,
      status: undefined,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4">
          <div className="flex items-center gap-20">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearAll}
              className="text-sm text-rose-500 hover:text-rose-600 font-medium uppercase tracking-wide"
            >
              Clear All
            </Button>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg">Filter</DialogTitle>
              {activeFilterCount > 0 && (
                <Badge
                  variant="default"
                  className="size-6 rounded-full flex items-center justify-center p-0 bg-blue-600 text-white"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* School Type */}
          <Controller
            name="schoolType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="schoolType">School Type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="schoolType"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="O' Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Exam Type */}
          <Controller
            name="examType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="examType">Exam Type</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="examType"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="JAMB" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Course */}
          <Controller
            name="course"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="course">COURSES</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="course" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="MAT 101" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesTypes.map((course) => (
                      <SelectItem key={course.value} value={course.value}>
                        {course.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Status */}
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Successful" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Date Range */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setDateExpanded(!dateExpanded)}
              className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            >
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  dateExpanded && "rotate-180"
                )}
              />
              Date
            </button>

            {dateExpanded && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* From Date */}
                <Controller
                  name="dateFrom"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs text-muted-foreground">
                        From
                      </FieldLabel>
                      <DatePickerField
                        date={field.value}
                        onDateSelect={field.onChange}
                        placeholder="Pick a date"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* To Date */}
                <Controller
                  name="dateTo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs text-muted-foreground">
                        To
                      </FieldLabel>
                      <DatePickerField
                        date={field.value}
                        onDateSelect={field.onChange}
                        placeholder="Pick a date"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-background pt-4 flex items-center justify-center">
            <Button
              type="submit"
              className="w-10/12 mx-auto bg-sidebar-primary hover:bg-sidebar-primary/80 text-black font-medium h-12 rounded-full"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ DATE PICKER FIELD ============
interface DatePickerFieldProps {
  date: Date | null | undefined;
  onDateSelect: (date: Date | undefined) => void;
  placeholder?: string;
}

function DatePickerField({
  date,
  onDateSelect,
  placeholder = "Pick a date",
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "do MMMM") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(selectedDate) => {
            onDateSelect(selectedDate);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
