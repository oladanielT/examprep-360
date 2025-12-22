// ===========================================
// FILE: components/ui/custom-form-field.tsx
// Global Form Field Wrapper
// ===========================================
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  labelClassName?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FormField({
  label,
  labelClassName,
  error,
  hint,
  required = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2 flex  flex-col w-full", className)}>
      {label && (
        <Label
          className={cn(
            "  tracking-[3px] text-xs! uppercase text-gray-400 font-medium ",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}

// Pre-configured Input Field
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
  containerLabelClassName?: string;
  icon?: React.ReactNode;
}

export function InputField({
  label,
  error,
  hint,
  containerLabelClassName,
  required,
  containerClassName,
  className,
  icon,
  ...props
}: InputFieldProps) {
  return (
    <FormField
      labelClassName={containerLabelClassName}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <Input
        className={cn(
          error && "border-rose-500 focus-visible:ring-rose-500",
          "rounded-4xl  placeholder:text-gray-400 h-14",
          className
        )}
        {...props}
      />
      {icon}
    </FormField>
  );
}

// Pre-configured Textarea Field
interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

export function TextareaField({
  label,
  error,
  hint,
  required,
  containerClassName,
  className,
  ...props
}: TextareaFieldProps) {
  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <Textarea
        className={cn(
          error && "border-rose-500 focus-visible:ring-rose-500",
          className
        )}
        {...props}
      />
    </FormField>
  );
}
