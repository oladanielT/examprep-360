import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";

// Extracted date picker component for reusability
interface DatePickerButtonProps {
  label: string;
  date?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date?: Date) => void;
}

export function DatePickerButton({
  label,
  date,
  open,
  onOpenChange,
  onDateSelect,
}: DatePickerButtonProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal rounded-xl",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

{
  /* Examples From Date Picker */
}
// <DatePickerButton
//   label="From"
//   date={filters.dateFrom}
//   open={fromDateOpen}
//   onOpenChange={setFromDateOpen}
//   onDateSelect={(date) => handleDateChange("from", date)}
// />

// {/* To Date Picker */}
// <DatePickerButton
//   label="To"
//   date={filters.dateTo}
//   open={toDateOpen}
//   onOpenChange={setToDateOpen}
//   onDateSelect={(date) => handleDateChange("to", date)}
// />
