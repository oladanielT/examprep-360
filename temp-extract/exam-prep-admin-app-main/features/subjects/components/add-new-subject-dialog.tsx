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

interface AddNewSubjectDialogProps {
  children: React.ReactNode;
  onSubmit?: (data: SubjectFormData) => void | Promise<void>;
}

export interface SubjectFormData {
  subjectName: string;
  duration: string;
  exam: string;
  questionCount: string;
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

// Exam options
export const EXAM_OPTIONS = [
  { value: "waec", label: "WAEC" },
  { value: "neco", label: "NECO" },
  { value: "jamb", label: "JAMB" },
  { value: "utme", label: "Post-UTME" },
  { value: "ncee", label: "NCEE" },
  { value: "bece", label: "BECE" },
];

// Question count options
const QUESTION_COUNT_OPTIONS = [
  { value: "10", label: "10 questions" },
  { value: "20", label: "20 questions" },
  { value: "30", label: "30 questions" },
  { value: "50", label: "50 questions" },
  { value: "100", label: "100 questions" },
];

export function AddNewSubjectDialog({
  children,
  onSubmit,
}: AddNewSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubjectFormData>({
    subjectName: "",
    duration: "",
    exam: "",
    questionCount: "",
  });
  const [errors, setErrors] = useState<Partial<SubjectFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SubjectFormData> = {};

    if (!formData.subjectName.trim()) {
      newErrors.subjectName = "Subject name is required";
    }
    if (!formData.duration) {
      newErrors.duration = "Duration is required";
    }
    if (!formData.exam) {
      newErrors.exam = "Exam is required";
    }
    if (!formData.questionCount) {
      newErrors.questionCount = "Number of questions is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SubjectFormData, value: string) => {
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
        subjectName: "",
        duration: "",
        exam: "",
        questionCount: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error - you might want to show a toast or error message
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
                Add New Subject
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <InputField
            placeholder="e.g., Mathematics"
            label="Subject Name"
            value={formData.subjectName}
            onChange={(e) => handleInputChange("subjectName", e.target.value)}
            error={errors.subjectName}
            required
          />

          <CustomSelect
            label="Duration Of Mock Exams"
            placeholder="Select duration"
            options={DURATION_OPTIONS}
            value={formData.duration}
            onValueChange={(value) => handleInputChange("duration", value)}
            error={errors.duration}
          />

          <CustomSelect
            label="Exam"
            placeholder="Select exam"
            options={EXAM_OPTIONS}
            value={formData.exam}
            onValueChange={(value) => handleInputChange("exam", value)}
            error={errors.exam}
          />

          <CustomSelect
            label="Number of Mock Questions"
            placeholder="Select number of questions"
            options={QUESTION_COUNT_OPTIONS}
            value={formData.questionCount}
            onValueChange={(value) => handleInputChange("questionCount", value)}
            error={errors.questionCount}
          />

          <PrimaryButton
            title={isLoading ? "Adding Subject..." : "Add Subject"}
            type="submit"
            disabled={isLoading}
            className="max-w-full"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
