"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import type { QuestionEditorFormData } from "../schemas/question-validation";

export function TrueFalseOptions() {
  const { control } = useFormContext<QuestionEditorFormData>();

  return (
    <Controller
      name="trueFalseData.correctAnswer"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="space-y-4">
            <FieldLabel>Correct Answer</FieldLabel>

            <div className="grid grid-cols-2 gap-4">
              {/* True Option */}
              <Card
                className={`p-4 cursor-pointer transition-all hover:border-[#BEE74C] ${
                  field.value === "true"
                    ? "border-[#BEE74C] bg-[#BEE74C]/10"
                    : "border-border"
                }`}
                onClick={() => field.onChange("true")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={field.name}
                    id="answer-true"
                    className="h-5 w-5 accent-[#BEE74C]"
                    checked={field.value === "true"}
                    onChange={() => field.onChange("true")}
                    aria-invalid={fieldState.invalid}
                  />
                  <Label
                    htmlFor="answer-true"
                    className="text-lg font-semibold cursor-pointer"
                  >
                    True
                  </Label>
                </div>
              </Card>

              {/* False Option */}
              <Card
                className={`p-4 cursor-pointer transition-all hover:border-[#BEE74C] ${
                  field.value === "false"
                    ? "border-[#BEE74C] bg-[#BEE74C]/10"
                    : "border-border"
                }`}
                onClick={() => field.onChange("false")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={field.name}
                    id="answer-false"
                    className="h-5 w-5 accent-[#BEE74C]"
                    checked={field.value === "false"}
                    onChange={() => field.onChange("false")}
                    aria-invalid={fieldState.invalid}
                  />
                  <Label
                    htmlFor="answer-false"
                    className="text-lg font-semibold cursor-pointer"
                  >
                    False
                  </Label>
                </div>
              </Card>
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

            <p className="text-sm text-muted-foreground">
              Select the correct answer for this True/False question
            </p>
          </div>
        </Field>
      )}
    />
  );
}
