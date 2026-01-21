// ===========================================
// FILE: components/ui/custom-dropzone.tsx
// Custom Dropzone Field with KiboUI Dropzone Base
// ===========================================
"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import type { FileRejection, DropEvent } from "react-dropzone";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone";
import { FormField } from "./custom-form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropzoneFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
  disabled?: boolean;
  className?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export function DropzoneField({
  label,
  error,
  hint,
  required,
  containerClassName,
  accept = { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
  maxSize = 1024 * 1024, // 1MB default
  maxFiles = 1,
  value = [],
  onChange,
  onDropRejected,
  disabled,
  className,
}: DropzoneFieldProps) {
  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleDrop = (
    acceptedFiles: File[],
    _fileRejections: FileRejection[],
    _event: DropEvent
  ) => {
    onChange?.(acceptedFiles);
  };

  const handleDropRejected = (fileRejections: FileRejection[]) => {
    onDropRejected?.(fileRejections);
  };

  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      <Dropzone
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        disabled={disabled}
        src={value}
        onDrop={handleDrop}
        onDropRejected={handleDropRejected}
        className={cn(
          "relative rounded-full border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 text-center transition-all duration-200",
          error && "border-rose-300 bg-rose-50",
          className
        )}
      >
        <div className="space-y-3 w-full">
          {/* Empty State */}
          <DropzoneEmptyState className="py-2">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-gray-100">
                <Upload size={20} className="text-gray-900" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 text-sm">
                  Click to upload
                </span>
                <span className="text-gray-500 text-sm">or drag and drop</span>
              </div>
              <p className="mt-3 text-gray-400 text-xs">
                {accept["image/*"]?.join(", ").replace(/\./g, "") || "Images"}
                {maxSize && ` (max ${formatBytes(maxSize)})`}
              </p>
            </div>
          </DropzoneEmptyState>

          {/* Filled State */}
          <DropzoneContent className="py-2">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-green-100">
                <Upload size={20} className="text-green-600" />
              </div>
              <p className="font-medium text-gray-700 text-sm">
                Ready to upload
              </p>
              <p className="mt-1 text-gray-500 text-xs">or drag to replace</p>
            </div>
          </DropzoneContent>

          {/* File Preview List */}
          {value && value.length > 0 && (
            <div className="space-y-2">
              {value.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-700 text-sm">
                      {file.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className="ml-2 h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <X size={16} className="text-gray-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dropzone>
    </FormField>
  );
}

// Usage Example:
// const [files, setFiles] = React.useState<File[]>([]);
// const [rejections, setRejections] = React.useState<FileRejection[]>([]);
//
// <DropzoneField
//   label="Upload a picture"
//   hint="JPEG, PNG or GIF (max. 1mb)"
//   required
//   accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif"] }}
//   maxSize={1024 * 1024}
//   value={files}
//   onChange={setFiles}
//   onDropRejected={(rejections) => {
//     rejections.forEach((file) => {
//       file.errors.forEach((err) => {
//         console.error(`${file.file.name}: ${err.message}`);
//       });
//     });
//     setRejections(rejections);
//   }}
//   error={rejections.length > 0 ? "Some files were rejected" : undefined}
// />
