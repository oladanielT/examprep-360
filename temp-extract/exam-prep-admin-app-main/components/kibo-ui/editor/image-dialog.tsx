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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, LinkIcon, AlertCircle } from "lucide-react";

const imageSchema = z.object({
  src: z.string().min(1, "Image URL is required").url("Must be a valid URL"),
  alt: z.string().optional(),
  title: z.string().optional(),
});

type ImageFormValues = z.infer<typeof imageSchema>;

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (data: { src: string; alt?: string; title?: string }) => void;
}

export function ImageDialog({ open, onOpenChange, onInsert }: ImageDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      src: "",
      alt: "",
      title: "",
    },
    mode: "onChange",
  });

  const watchSrc = form.watch("src");

  // Preview image when URL changes
  useEffect(() => {
    if (watchSrc && watchSrc.match(/^https?:\/\/.+/)) {
      setPreviewUrl(watchSrc);
      setPreviewError(false);
    } else {
      setPreviewUrl(null);
    }
  }, [watchSrc]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setPreviewUrl(null);
      setPreviewError(false);
    }
  }, [open, form]);

  const onSubmit = (data: ImageFormValues) => {
    onInsert({
      src: data.src,
      alt: data.alt || undefined,
      title: data.title || undefined,
    });
    onOpenChange(false);
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Add an image to your content by providing a URL
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Controller
            name="src"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Image URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="https://example.com/image.jpg"
                    className={`pl-9 ${fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoFocus
                  />
                </div>
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
            name="alt"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Alt Text
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Describe the image for accessibility..."
                />
                <p className="text-xs text-muted-foreground">
                  Helps screen readers describe the image
                </p>
              </div>
            )}
          />

          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Optional tooltip text..."
                />
                <p className="text-xs text-muted-foreground">
                  Shows as a tooltip when hovering over the image
                </p>
              </div>
            )}
          />

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[120px] flex items-center justify-center">
                {previewError ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                    <p className="text-sm">Failed to load image</p>
                    <p className="text-xs">Check if the URL is correct</p>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-48 rounded shadow-sm"
                    onError={handleImageError}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Insert Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
