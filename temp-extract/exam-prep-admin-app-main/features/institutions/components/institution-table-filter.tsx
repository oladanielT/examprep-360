"use client";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CustomNumberSlider } from "@/components/custom/custom-number-slider";
import PrimaryButton from "@/components/buttons/primary-button";
import { Field, FieldError } from "@/components/ui/field";
import { useInstitutionFilters } from "../lib/institution-url-state";

// ============ VALIDATION SCHEMA ============
const filterSchema = z
  .object({
    courses: z.number().min(0).max(500),
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
interface FilterDialogProps {
  children: React.ReactNode;
}

export function FilterDialog({ children }: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  // Get filters from URL
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useInstitutionFilters();

  // Setup form
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      courses: filters.courses || 0,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    },
  });

  // Sync form when URL changes
  useEffect(() => {
    form.reset({
      courses: filters.courses || 0,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
    });
  }, [filters, form]);

  // When form is submitted
  const onSubmit = (data: FilterFormValues) => {
    updateFilters({
      courses: data.courses > 0 ? data.courses : null,
      dateFrom: data.dateFrom || null,
      dateTo: data.dateTo || null,
    });
    setOpen(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    clearFilters();
    form.reset({
      courses: 0,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto px-6 py-4">
        <DialogHeader>
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Courses Slider */}
          <Controller
            name="courses"
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
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* From Date */}
                <Controller
                  name="dateFrom"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          From
                        </label>
                        <Popover
                          open={fromDateOpen}
                          onOpenChange={setFromDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {field.value ? (
                                format(field.value, "do MMMM")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => {
                                field.onChange(date);
                                setFromDateOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
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
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          To
                        </label>
                        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {field.value ? (
                                format(field.value, "do MMMM")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => {
                                field.onChange(date);
                                setToDateOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <PrimaryButton type="submit" title="Save" className="max-w-full" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
