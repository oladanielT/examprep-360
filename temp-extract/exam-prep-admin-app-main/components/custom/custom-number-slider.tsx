"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface CustomNumberSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  unit?: string;
}

function CustomNumberSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  label,
  showValue = true,
  valueFormat,
  unit = "",
  ...props
}: CustomNumberSliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max],
    [value, defaultValue, min, max]
  );

  const currentValue = _values[_values.length - 1];
  const displayValue = valueFormat ? valueFormat(currentValue) : currentValue;

  return (
    <div className="w-full space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="tracking-[3px] text-xs uppercase text-gray-400 font-medium">
            {label}
          </label>
          {showValue && (
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-900">
                {displayValue}
              </span>
              {unit && <span className="text-xs text-gray-500">{unit}</span>}
            </div>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-gray-200 relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-red-500 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-red-500 ring-red-500/20 block size-5 shrink-0 rounded-full border-2 bg-white shadow-md transition-[color,box-shadow] hover:ring-4 hover:shadow-lg focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}

export { CustomNumberSlider };

// import { CustomNumberSlider } from "@/components/custom/custom-number-slider";

// <CustomNumberSlider
//   label="Number of Subjects"
//   value={[100]}
//   onValueChange={handleChange}
//   min={0}
//   max={500}
//   step={1}
//   showValue={true}
// />
