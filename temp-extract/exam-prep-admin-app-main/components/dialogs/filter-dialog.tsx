"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import PrimaryButton from "../buttons/primary-button";
interface FilterOptions {
  courses?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
interface FilterDialogProps {
  children: React.ReactNode;
  filters: FilterOptions;
  filterComp?: React.ReactNode;
  activeFilters?: number;
  onFiltersChange: (filters: FilterOptions) => void;
  onSave?: (filters: { fromDate: string; toDate: string }) => void;
  onClearAll?: () => void;
}

export function FilterDialog({
  children,
  filterComp,
  activeFilters = 1,
  filters,
  onFiltersChange,
  onSave,
  onClearAll,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const handleSave = () => {
    if (onSave) {
      // onSave({});
    }
    setOpen(false);
  };

  const handleClearAll = () => {

    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 hover:bg-transparent p-0 h-auto font-medium text-sm"
            >
              CLEAR ALL
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <DialogTitle className="text-xl font-medium">Filter</DialogTitle>
              {activeFilters > 0 && (
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center p-0">
                  {activeFilters}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 pt-6">
          {filterComp}
          <Collapsible open={dateExpanded} onOpenChange={setDateExpanded}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${dateExpanded ? "rotate-0" : "-rotate-90"
                  }`}
              />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Date
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* From Date */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">From</label>
                  <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "do MMMM")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => {
                          onFiltersChange({ ...filters, dateFrom: date });
                          setFromDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">To</label>
                  <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "do MMMM")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => {
                          onFiltersChange({ ...filters, dateTo: date });
                          setToDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <PrimaryButton title="Save" className=" max-w-full" />


        </div>
      </DialogContent>
    </Dialog>
  );
}
