import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

export interface CheckboxSelectOption {
  label: string;
  value: string;
}

interface CheckboxSelectProps {
  options: CheckboxSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function CheckboxSelect({
  options,
  value,
  onValueChange,
  label,
  error,
  required = false,
  className,
}: CheckboxSelectProps) {
  return (
    <div className={cn("w-full flex flex-col space-y-3", className)}>
      {label && (
        <Label className="tracking-[3px] text-xs uppercase text-gray-400 font-medium">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </Label>
      )}

      <div className="flex items-center gap-6">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={option.value}
              checked={value === option.value}
              onCheckedChange={(checked) => {
                if (checked) {
                  onValueChange?.(option.value);
                }
              }}
              className="w-5 h-5"
            />
            <Label
              htmlFor={option.value}
              className="text-sm font-medium cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
