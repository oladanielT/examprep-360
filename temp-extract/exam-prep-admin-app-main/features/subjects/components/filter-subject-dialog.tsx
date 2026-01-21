"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { DatePickerButton } from "@/components/custom/custome-datepicker";
import PrimaryButton from "@/components/buttons/primary-button";

import { useSubjectFilters } from "../lib/subjects-url-state";
import { useAllExamTypes, ExamTypesResponse } from "@/features/exams/api/exam-types/get-all-exam-types";

// ============ VALIDATION SCHEMA ============
const filterSchema = z
  .object({
    examTypeId: z.string().optional(),
    dateFrom: z.date().nullable().optional(),
    dateTo: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
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
interface FilterSubjectDialogProps {
  children: React.ReactNode;
}

export function FilterSubjectDialog({ children }: FilterSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  // Get filters from URL
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useSubjectFilters();

  // Fetch exam types
  const { data: examTypesData, isLoading: isLoadingExamTypes } = useAllExamTypes({
    limit: 100, // Get all exam types for filter
  }) as { data: ExamTypesResponse | undefined; isLoading: boolean };

  const examTypes = examTypesData?.data || [];

  // Setup form
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      examTypeId: filters.examTypeId || undefined,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    },
  });

  // Sync form when URL changes
  useEffect(() => {
    form.reset({
      examTypeId: filters.examTypeId || undefined,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    });
  }, [filters, form]);

  // When form is submitted
  const onSubmit = (data: FilterFormValues) => {
    updateFilters({
      examTypeId: data.examTypeId || null,
      dateFrom: data.dateFrom || null,
      dateTo: data.dateTo || null,
    });
    setOpen(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    clearFilters();
    form.reset({
      examTypeId: undefined,
      dateFrom: null,
      dateTo: null,
    });
    setDateExpanded(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader className="flex items-center justify-between">
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
                className="size-6 rounded-full flex items-center justify-center p-0 bg-blue-600 text-white text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Exam Type Filter */}
          <Controller
            name="examTypeId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="examTypeId">Exam Type</FieldLabel>
                {isLoadingExamTypes ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="examTypeId" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((examType) => (
                        <SelectItem key={examType.id} value={examType.id}>
                          {examType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Date Range Filter */}
          <Collapsible open={dateExpanded} onOpenChange={setDateExpanded}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  dateExpanded ? "rotate-0" : "-rotate-90"
                )}
              />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Date Range
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* From Date */}
                <Controller
                  name="dateFrom"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <DatePickerButton
                        label="From"
                        date={field.value || undefined}
                        open={fromDateOpen}
                        onOpenChange={setFromDateOpen}
                        onDateSelect={(date) => {
                          field.onChange(date);
                          setFromDateOpen(false);
                        }}
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
                      <DatePickerButton
                        label="To"
                        date={field.value || undefined}
                        open={toDateOpen}
                        onOpenChange={setToDateOpen}
                        onDateSelect={(date) => {
                          field.onChange(date);
                          setToDateOpen(false);
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Save Button */}
          <PrimaryButton type="submit" title="Save" className="max-w-full" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
