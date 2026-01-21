"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { QuestionEditorFormData } from "../schemas/question-validation";

export function FillInBlankOptions() {
  const { control, watch } = useFormContext<QuestionEditorFormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "fillInBlankData.blanks",
  });
  const [newAnswer, setNewAnswer] = useState<{ [key: string]: string }>({});

  const handleAddBlank = () => {
    append({
      id: `blank${fields.length + 1}`,
      acceptableAnswers: [],
      caseSensitive: false,
      marks: 1,
      hint: "",
      inputType: "text" as const,
    });
  };

  const handleDeleteBlank = (index: number) => {
    if (fields.length <= 1) {
      toast.error("At least one blank is required");
      return;
    }
    remove(index);
  };

  const handleAddAnswer = (index: number, blankId: string) => {
    const answer = newAnswer[blankId]?.trim();
    if (!answer) {
      toast.error("Please enter an answer");
      return;
    }

    const blank = fields[index];
    if (blank.acceptableAnswers.includes(answer)) {
      toast.error("This answer already exists");
      return;
    }

    update(index, {
      ...blank,
      acceptableAnswers: [...blank.acceptableAnswers, answer],
    });

    setNewAnswer({ ...newAnswer, [blankId]: "" });
  };

  const handleRemoveAnswer = (index: number, answer: string) => {
    const blank = fields[index];
    if (blank.acceptableAnswers.length <= 1) {
      toast.error("At least one acceptable answer is required");
      return;
    }

    update(index, {
      ...blank,
      acceptableAnswers: blank.acceptableAnswers.filter((a) => a !== answer),
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Input */}
      <Controller
        name="fillInBlankData.template"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Template <span className="text-muted-foreground">(Use _____ for blanks)</span>
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Example: The capital of France is _____."
              className="min-h-[100px]"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            <p className="text-sm text-muted-foreground">
              Use _____ (5 underscores) to mark where blanks should appear
            </p>
          </Field>
        )}
      />

      {/* Blanks Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Blanks Configuration</Label>
          <p className="text-sm text-muted-foreground">
            {fields.length} blank{fields.length !== 1 ? "s" : ""} configured
          </p>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                Blank {index + 1} ({field.id})
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteBlank(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Acceptable Answers */}
            <div className="space-y-2">
              <Label>Acceptable Answers</Label>
              <div className="flex gap-2">
                <Input
                  value={newAnswer[field.id] || ""}
                  onChange={(e) =>
                    setNewAnswer({ ...newAnswer, [field.id]: e.target.value })
                  }
                  placeholder="Enter an acceptable answer"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAnswer(index, field.id);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAnswer(index, field.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* List of answers */}
              {field.acceptableAnswers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.acceptableAnswers.map((answer, ansIdx) => (
                    <div
                      key={ansIdx}
                      className="flex items-center gap-1 bg-[#BEE74C]/10 border border-[#BEE74C]/30 rounded-md px-2 py-1"
                    >
                      <span className="text-sm">{answer}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(index, answer)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Marks */}
            <Controller
              name={`fillInBlankData.blanks.${index}.marks`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Marks</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min="0"
                    step="0.5"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Case Sensitive */}
            <Controller
              name={`fillInBlankData.blanks.${index}.caseSensitive`}
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

            {/* Hint (Optional) */}
            <Controller
              name={`fillInBlankData.blanks.${index}.hint`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Hint <span className="text-muted-foreground">(Optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Optional hint for students"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </Card>
        ))}

        <Button
          type="button"
          variant="ghost"
          className="w-full hover:bg-[#BEE74C]/10 hover:text-[#BEE74C]"
          onClick={handleAddBlank}
        >
          + Add Blank
        </Button>
      </div>
    </div>
  );
}
