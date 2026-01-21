"use client";

import React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { X, Plus, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import type { QuestionEditorFormData } from "../schemas/question-validation";

export function CalculationOptions() {
  const { control } = useFormContext<QuestionEditorFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "calculationData.steps",
  });
  const handleAddStep = () => {
    append({
      step: "",
      explanation: "",
      formula: "",
      result: "",
    });
  };

  const handleDeleteStep = (index: number) => {
    if (fields.length <= 1) {
      toast.error("At least one step is required");
      return;
    }
    remove(index);
  };

  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    move(index, index - 1);
  };

  const handleMoveStepDown = (index: number) => {
    if (index === fields.length - 1) return;
    move(index, index + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        {/* Problem Description */}
        <Controller
          name="calculationData.problem"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Problem Description</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="Brief description of the calculation problem"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Final Answer and Units */}
        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="calculationData.finalAnswer"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Final Answer</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g., 154 or 3.14"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="calculationData.units"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Units</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g., cm², m/s, kg"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="calculationData.precision"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Decimal Places</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="0"
                  max="10"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Show Steps Toggle */}
        <Controller
          name="calculationData.showSteps"
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
                  Show step-by-step solution to students
                </Label>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </Card>

      {/* Solution Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Solution Steps</Label>
          <p className="text-sm text-muted-foreground">
            {fields.length} step{fields.length !== 1 ? "s" : ""}
          </p>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Step {index + 1}</h4>
              <div className="flex items-center gap-1">
                {/* Move Up */}
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMoveStepUp(index)}
                    title="Move up"
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                )}
                {/* Move Down */}
                {index < fields.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleMoveStepDown(index)}
                    title="Move down"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                )}
                {/* Delete */}
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteStep(index)}
                    title="Delete step"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Step Description */}
            <Controller
              name={`calculationData.steps.${index}.step`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Step Description</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g., Substitute values: Area = (22/7) × 7 × 7"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Formula (Optional) */}
            <Controller
              name={`calculationData.steps.${index}.formula`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Formula <span className="text-muted-foreground">(Optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g., A = πr²"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Result (Optional) */}
            <Controller
              name={`calculationData.steps.${index}.result`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Result <span className="text-muted-foreground">(Optional)</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g., 154"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Explanation */}
            <Controller
              name={`calculationData.steps.${index}.explanation`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Explanation</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Explain what's happening in this step"
                    className="min-h-[80px]"
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
          onClick={handleAddStep}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>
    </div>
  );
}
