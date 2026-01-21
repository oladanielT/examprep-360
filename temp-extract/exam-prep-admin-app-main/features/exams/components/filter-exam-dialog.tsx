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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { CustomNumberSlider } from "@/components/custom/custom-number-slider";
import { DatePickerButton } from "@/components/custom/custome-datepicker";
import { Field, FieldError } from "@/components/ui/field";
import { useExamFilters } from "../lib/exam-url-state";

// ============ TYPES & SCHEMA ============

const filterSchema = z
  .object({
    subjects: z.number().min(0).max(500),
    subscribers: z.number().min(0).max(500),
    dateFrom: z.date().optional().nullable(),
    dateTo: z.date().optional().nullable(),
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

interface FilterExamDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApply?: () => void;
}

// ============ COMPONENT ============

export function FilterExamDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onApply,
}: FilterExamDialogProps) {
  // Get URL state from nuqs
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useExamFilters();

  // Form setup
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      subjects: filters.subjects || 0,
      subscribers: filters.subscribers || 0,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    },
    mode: "onChange",
  });

  // Sync form with URL state when filters change externally
  useEffect(() => {
    form.reset(
      {
        subjects: filters.subjects || 0,
        subscribers: filters.subscribers || 0,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
      },
      {
        keepDirty: false,
      }
    );
  }, [filters, form]);

  // Handle clear all
  const handleClearAll = () => {
    clearFilters();
    form.reset({
      subjects: 0,
      subscribers: 0,
      dateFrom: null,
      dateTo: null,
    });
  };

  // Handle form submission
  const onSubmit = (data: FilterFormValues) => {
    // Update URL state (only include non-zero values)
    updateFilters({
      subjects: data.subjects > 0 ? data.subjects : null,
      subscribers: data.subscribers > 0 ? data.subscribers : null,
      dateFrom: data.dateFrom || null,
      dateTo: data.dateTo || null,
    });

    onApply?.();
    controlledOnOpenChange?.(false);
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={controlledOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader className="relative">
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Number of Subjects */}
          <Controller
            name="subjects"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <CustomNumberSlider
                  label="Number of Subjects"
                  value={[field.value || 0]}
                  onValueChange={(values) => field.onChange(values[0])}
                  min={0}
                  max={500}
                  step={1}
                  showValue={true}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Number of Subscribers */}
          <Controller
            name="subscribers"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <CustomNumberSlider
                  label="Number of Subscriber"
                  value={[field.value || 0]}
                  onValueChange={(values) => field.onChange(values[0])}
                  min={0}
                  max={500}
                  step={1}
                  showValue={true}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Date Range */}
          <DateRangeField form={form} />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-[#BEE74C] hover:bg-[#B0D945] text-black font-medium"
          >
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ DATE RANGE FIELD COMPONENT ============

interface DateRangeFieldProps {
  form: ReturnType<typeof useForm<FilterFormValues>>;
}

function DateRangeField({ form }: DateRangeFieldProps) {
  const [dateExpanded, setDateExpanded] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  return (
    <Collapsible open={dateExpanded} onOpenChange={setDateExpanded}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full">
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            dateExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Date
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
  );
}
