"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Question range options
const QUESTION_RANGE_OPTIONS = [
  { value: "1-10", label: "1-10 Questions" },
  { value: "11-20", label: "11-20 Questions" },
  { value: "21-30", label: "21-30 Questions" },
  { value: "31-50", label: "31-50 Questions" },
  { value: "51-100", label: "51-100 Questions" },
  { value: "100+", label: "100+ Questions" },
];

// Exam options
const EXAM_OPTIONS = [
  { value: "waec", label: "WAEC" },
  { value: "neco", label: "NECO" },
  { value: "jamb", label: "JAMB" },
  { value: "utme", label: "Post-UTME" },
  { value: "ncee", label: "NCEE" },
  { value: "bece", label: "BECE" },
];

interface QuestionSelectsProps {
  onQuestionRangeChange?: (value: string) => void;
  onExamChange?: (value: string) => void;
  defaultQuestionRange?: string;
  defaultExam?: string;
}

const QuestionSelects = ({
  onQuestionRangeChange,
  onExamChange,
  defaultQuestionRange = "",
  defaultExam = "",
}: QuestionSelectsProps) => {
  const [questionRange, setQuestionRange] = useState(defaultQuestionRange);
  const [exam, setExam] = useState(defaultExam);

  const handleQuestionRangeChange = (value: string) => {
    setQuestionRange(value);
    onQuestionRangeChange?.(value);
  };

  const handleExamChange = (value: string) => {
    setExam(value);
    onExamChange?.(value);
  };

  return (
    <div className="grid grid-cols-2 gap-10 mt-10">
      {/* Questions Range */}
      <div>
        <Label className="tracking-[3px] mb-2 text-xs uppercase text-gray-400">
          Questions Range
        </Label>
        <Select value={questionRange} onValueChange={handleQuestionRangeChange}>
          <SelectTrigger className="w-full rounded-4xl px-5 data-[placeholder]:text-black !h-14">
            <SelectValue placeholder="Select" className="text-black" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exam Selection */}
      <div>
        <Label className="tracking-[3px] mb-2 text-xs uppercase text-gray-400">
          Select Exam
        </Label>
        <Select value={exam} onValueChange={handleExamChange}>
          <SelectTrigger className="w-full rounded-4xl px-5 data-[placeholder]:text-black !h-14">
            <SelectValue placeholder="Select" className="text-black" />
          </SelectTrigger>
          <SelectContent>
            {EXAM_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuestionSelects;
