"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { QuestionEditorFormData } from "../schemas/question-validation";

export function EssayOptions() {
  const { control, watch, setValue } = useFormContext<QuestionEditorFormData>();
  const [newPoint, setNewPoint] = useState("");

  const expectedPoints = watch("essayData.expectedPoints") || [];

  const handleAddPoint = () => {
    const point = newPoint.trim();
    if (!point) {
      toast.error("Please enter an expected point");
      return;
    }

    if (expectedPoints.includes(point)) {
      toast.error("This point already exists");
      return;
    }

    setValue("essayData.expectedPoints", [...expectedPoints, point]);
    setNewPoint("");
  };

  const handleRemovePoint = (point: string) => {
    setValue("essayData.expectedPoints", expectedPoints.filter((p) => p !== point));
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        {/* Word Count Limits */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="essayData.minWords"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Minimum Words</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="0"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="essayData.maxWords"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Maximum Words</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="0"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Expected Points */}
        <div className="space-y-2">
          <Label>Expected Points to Cover</Label>
          <div className="flex gap-2">
            <Input
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              placeholder="e.g., Introduction, Main Arguments, Conclusion"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPoint();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPoint}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List of expected points */}
          {expectedPoints.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {expectedPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-[#BEE74C]/10 border border-[#BEE74C]/30 rounded-md px-2 py-1"
                >
                  <span className="text-sm">{point}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(point)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Add key points that students should address in their essay
          </p>
        </div>

        {/* Sample Answer */}
        <Controller
          name="essayData.sampleAnswer"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Sample Answer <span className="text-muted-foreground">(Optional)</span>
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Provide a sample answer or key points to guide grading..."
                className="min-h-[150px]"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <p className="text-sm text-muted-foreground">
                This will help instructors grade student responses
              </p>
            </Field>
          )}
        />

        {/* Additional Settings */}
        <div className="space-y-3">
          <Controller
            name="essayData.allowDrafts"
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
                    Allow students to save drafts
                  </Label>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="essayData.spellCheckEnabled"
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
                    Enable spell check
                  </Label>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </Card>
    </div>
  );
}
