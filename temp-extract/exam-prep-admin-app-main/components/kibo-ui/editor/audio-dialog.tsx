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
import { AudioLinesIcon, LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";

const audioSchema = z.object({
  src: z.string().min(1, "Audio URL is required").url("Must be a valid URL"),
  title: z.string().optional(),
});

type AudioFormValues = z.infer<typeof audioSchema>;

interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (data: { src: string; title?: string }) => void;
}

// Helper to detect audio type
function getAudioType(url: string): string | null {
  if (!url) return null;

  const match = url.match(/\.(mp3|wav|ogg|aac|flac|m4a|webm)$/i);
  if (match) {
    return match[1].toUpperCase();
  }

  // Check for common audio hosting services
  if (url.includes("soundcloud.com")) return "SoundCloud";
  if (url.includes("spotify.com")) return "Spotify";

  return "Audio";
}

export function AudioDialog({ open, onOpenChange, onInsert }: AudioDialogProps) {
  const [audioType, setAudioType] = useState<string | null>(null);
  const [canPreview, setCanPreview] = useState(false);

  const form = useForm<AudioFormValues>({
    resolver: zodResolver(audioSchema),
    defaultValues: {
      src: "",
      title: "",
    },
    mode: "onChange",
  });

  const watchSrc = form.watch("src");

  // Detect audio type when URL changes
  useEffect(() => {
    if (watchSrc && watchSrc.match(/^https?:\/\/.+/)) {
      const type = getAudioType(watchSrc);
      setAudioType(type);

      // Check if it's a direct audio file that can be previewed
      const canPlay = /\.(mp3|wav|ogg|aac|m4a|webm)$/i.test(watchSrc);
      setCanPreview(canPlay);
    } else {
      setAudioType(null);
      setCanPreview(false);
    }
  }, [watchSrc]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setAudioType(null);
      setCanPreview(false);
    }
  }, [open, form]);

  const onSubmit = (data: AudioFormValues) => {
    onInsert({
      src: data.src,
      title: data.title || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AudioLinesIcon className="h-5 w-5 text-primary" />
            Insert Audio
          </DialogTitle>
          <DialogDescription>
            Embed an audio file for playback
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Controller
            name="src"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Audio URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="https://example.com/audio.mp3"
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
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Supported:</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">MP3</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">WAV</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">OGG</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">AAC</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">WebM</span>
                </div>
              </div>
            )}
          />

          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Caption
                </Label>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Optional audio caption..."
                />
                <p className="text-xs text-muted-foreground">
                  Displays below the audio player
                </p>
              </div>
            )}
          />

          {/* Audio Type Detection */}
          {audioType && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Detected</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{audioType} File</span>
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {canPreview && watchSrc && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <audio
                  src={watchSrc}
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
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
              <AudioLinesIcon className="h-4 w-4 mr-2" />
              Insert Audio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
