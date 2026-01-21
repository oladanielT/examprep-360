"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/custom/custom-form-field";
import { CustomSelect } from "@/components/custom/custom-select";
import PrimaryButton from "@/components/buttons/primary-button";

interface AssignManuallyDialogProps {
  children: React.ReactNode;
  onSubmit?: (data: AssignFormData) => void | Promise<void>;
}

export interface AssignFormData {
  userId: string;
  examId: string;
  duration: string;
}

// Duration options
const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

export function AssignManuallyDialog({
  children,
  onSubmit,
}: AssignManuallyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssignFormData>({
    userId: "",
    examId: "",
    duration: "",
  });
  const [errors, setErrors] = useState<Partial<AssignFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AssignFormData> = {};

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }
    if (!formData.examId.trim()) {
      newErrors.examId = "Exam ID is required";
    }
    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AssignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit?.(formData);

      // Reset form and close dialog on success
      setFormData({
        userId: "",
        examId: "",
        duration: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="absolute left-1/2 -translate-x-1/2">
              <DialogTitle className="text-xl font-semibold">
                Assign Manually
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <InputField
            placeholder="Enter"
            label="Enter User ID"
            value={formData.userId}
            onChange={(e) => handleInputChange("userId", e.target.value)}
            error={errors.userId}
            required
          />

          <InputField
            placeholder="Enter"
            label="Enter Exam ID"
            value={formData.examId}
            onChange={(e) => handleInputChange("examId", e.target.value)}
            error={errors.examId}
            required
          />

          <CustomSelect
            label="Duration"
            placeholder="Select duration"
            options={DURATION_OPTIONS}
            value={formData.duration}
            onValueChange={(value) => handleInputChange("duration", value)}
            error={errors.duration}
          />

          <PrimaryButton
            title={isLoading ? "Assigning" : "Assign"}
            type="submit"
            disabled={isLoading}
            className="max-w-full"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
