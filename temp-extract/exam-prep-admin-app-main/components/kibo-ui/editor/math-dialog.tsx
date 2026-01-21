"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SigmaIcon, AlertCircle } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

const mathSchema = z.object({
  latex: z.string().min(1, "LaTeX equation is required"),
  displayMode: z.boolean(),
});

type MathFormValues = z.infer<typeof mathSchema>;

interface MathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string, displayMode: boolean) => void;
}

export function MathDialog({ open, onOpenChange, onInsert }: MathDialogProps) {
  const [preview, setPreview] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);

  const form = useForm<MathFormValues>({
    resolver: zodResolver(mathSchema),
    defaultValues: {
      latex: "",
      displayMode: false,
    },
    mode: "onChange",
  });

  const watchLatex = form.watch("latex");
  const watchDisplayMode = form.watch("displayMode");

  // Render LaTeX preview
  useEffect(() => {
    if (watchLatex) {
      try {
        const html = katex.renderToString(watchLatex, {
          throwOnError: true,
          displayMode: watchDisplayMode,
        });
        setPreview(html);
        setPreviewError(null);
      } catch (error) {
        setPreviewError((error as Error).message);
        setPreview("");
      }
    } else {
      setPreview("");
      setPreviewError(null);
    }
  }, [watchLatex, watchDisplayMode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setPreview("");
      setPreviewError(null);
    }
  }, [open, form]);

  const onSubmit = (data: MathFormValues) => {
    onInsert(data.latex, data.displayMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SigmaIcon className="h-5 w-5 text-primary" />
            Insert Math Equation
          </DialogTitle>
          <DialogDescription>
            Write your equation using LaTeX syntax
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Controller
            name="latex"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  LaTeX Equation <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="E = mc^2"
                  className={`font-mono min-h-[80px] ${fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {fieldState.error && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="displayMode"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Display Mode (centered, larger)
                </Label>
              </div>
            )}
          />

          {/* Common Examples */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Examples</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Fraction", latex: "\\frac{a}{b}" },
                { label: "Square Root", latex: "\\sqrt{x}" },
                { label: "Power", latex: "x^{2}" },
                { label: "Subscript", latex: "x_{i}" },
                { label: "Integral", latex: "\\int_{0}^{1} x dx" },
                { label: "Sum", latex: "\\sum_{i=1}^{n} i" },
                { label: "Greek", latex: "\\alpha \\beta \\gamma" },
              ].map((example) => (
                <Button
                  key={example.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.getValues("latex");
                    form.setValue(
                      "latex",
                      current ? `${current} ${example.latex}` : example.latex,
                      { shouldValidate: true }
                    );
                  }}
                  className="text-xs"
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/30 min-h-[60px] flex items-center justify-center">
              {previewError ? (
                <div className="flex flex-col items-center gap-2 text-destructive">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-sm text-center">{previewError}</p>
                </div>
              ) : preview ? (
                <div
                  className="overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter LaTeX to see preview
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || !!previewError}
            >
              <SigmaIcon className="h-4 w-4 mr-2" />
              Insert Equation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
