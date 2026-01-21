"use client";

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
import { useState } from "react";
import PrimaryButton from "@/components/buttons/primary-button";

export interface FilterOptions {
    dateFrom?: Date;
    dateTo?: Date;
}

interface FilterDialogProps {
    children: React.ReactNode;
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    onApply?: () => void;
}

export function FilterDialog({
    children,
    filters,
    onFiltersChange,
    onApply,
}: FilterDialogProps) {
    const [open, setOpen] = useState(false);
    const [dateExpanded, setDateExpanded] = useState(false);
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    // Count active filters
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    const handleClearAll = () => {
        onFiltersChange({});
    };

    const handleSave = () => {
        onApply?.();
        setOpen(false);
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto px-6 py-4">
                <DialogHeader className=" ">
                    <div className="flex items-center gap-20">
                        <Button
                            variant="ghost"
                            onClick={handleClearAll}
                            className="text-sm text-rose-500 hover:text-rose-600 font-medium uppercase tracking-wide"
                        >
                            Clear All
                        </Button>
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-lg">Filter</DialogTitle>
                            {activeFiltersCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="size-6 rounded-full flex items-center justify-center p-0 bg-blue-600 text-white"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>


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
            </DialogContent>
        </Dialog>
    );
}
