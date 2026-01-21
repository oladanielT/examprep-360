"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { QuestionEditorFormData } from "../schemas/question-validation";

export function ShortAnswerOptions() {
  const { control, watch, setValue } = useFormContext<QuestionEditorFormData>();
  const [newAnswer, setNewAnswer] = useState("");

  const acceptableAnswers = watch("shortAnswerData.acceptableAnswers") || [];
  const caseSensitive = watch("shortAnswerData.caseSensitive") || false;
  const maxCharacters = watch("shortAnswerData.maxCharacters") || 10;

  const handleAddAnswer = () => {
    const answer = newAnswer.trim();
    if (!answer) {
      toast.error("Please enter an answer");
      return;
    }

    if (acceptableAnswers.includes(answer)) {
      toast.error("This answer already exists");
      return;
    }

    setValue("shortAnswerData.acceptableAnswers", [...acceptableAnswers, answer]);
    setNewAnswer("");
  };

  const handleRemoveAnswer = (answer: string) => {
    if (acceptableAnswers.length <= 1) {
      toast.error("At least one acceptable answer is required");
      return;
    }

    setValue("shortAnswerData.acceptableAnswers", acceptableAnswers.filter((a) => a !== answer));
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        {/* Acceptable Answers */}
        <div className="space-y-2">
          <Label>Acceptable Answers</Label>
          <div className="flex gap-2">
            <Input
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter an acceptable answer"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAnswer();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List of answers */}
          {acceptableAnswers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {acceptableAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-[#BEE74C]/10 border border-[#BEE74C]/30 rounded-md px-2 py-1"
                >
                  <span className="text-sm">{answer}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnswer(answer)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Add all possible correct answers. Students can provide any of these answers.
          </p>
        </div>

        {/* Max Characters */}
        <Controller
          name="shortAnswerData.maxCharacters"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Maximum Characters</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                min="1"
                onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <p className="text-sm text-muted-foreground">
                Limit the number of characters students can enter
              </p>
            </Field>
          )}
        />

        {/* Case Sensitive */}
        <Controller
          name="shortAnswerData.caseSensitive"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 accent-[#BEE74C]"
                  aria-invalid={fieldState.invalid}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  Case Sensitive
                </Label>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Card>
    </div>
  );
}
