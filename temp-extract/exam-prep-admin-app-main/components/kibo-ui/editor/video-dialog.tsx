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
import { VideoIcon, LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";

const videoSchema = z.object({
  src: z.string().min(1, "Video URL is required").url("Must be a valid URL"),
  title: z.string().optional(),
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (data: { src: string; title?: string }) => void;
}

// Helper to detect video type
function getVideoType(url: string): "youtube" | "vimeo" | "direct" | null {
  if (!url) return null;

  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) return "youtube";

  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) return "vimeo";

  if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return "direct";

  return null;
}

// Helper to get YouTube thumbnail
function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return null;
}

export function VideoDialog({ open, onOpenChange, onInsert }: VideoDialogProps) {
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "direct" | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      src: "",
      title: "",
    },
    mode: "onChange",
  });

  const watchSrc = form.watch("src");

  // Detect video type when URL changes
  useEffect(() => {
    if (watchSrc && watchSrc.match(/^https?:\/\/.+/)) {
      const type = getVideoType(watchSrc);
      setVideoType(type);

      if (type === "youtube") {
        setThumbnail(getYouTubeThumbnail(watchSrc));
      } else {
        setThumbnail(null);
      }
    } else {
      setVideoType(null);
      setThumbnail(null);
    }
  }, [watchSrc]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setVideoType(null);
      setThumbnail(null);
    }
  }, [open, form]);

  const onSubmit = (data: VideoFormValues) => {
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
            <VideoIcon className="h-5 w-5 text-primary" />
            Insert Video
          </DialogTitle>
          <DialogDescription>
            Embed a video from YouTube, Vimeo, or direct URL
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Controller
            name="src"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  Video URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="https://www.youtube.com/watch?v=..."
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
                  <span className="bg-muted px-1.5 py-0.5 rounded">YouTube</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">Vimeo</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">Direct MP4/WebM</span>
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
                  placeholder="Optional video caption..."
                />
                <p className="text-xs text-muted-foreground">
                  Displays below the video
                </p>
              </div>
            )}
          />

          {/* Video Type Detection */}
          {videoType && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Detected</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm capitalize">{videoType} Video</span>
              </div>
            </div>
          )}

          {/* YouTube Thumbnail Preview */}
          {thumbnail && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <img
                  src={thumbnail}
                  alt="Video thumbnail"
                  className="max-w-full rounded shadow-sm mx-auto"
                />
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
              <VideoIcon className="h-4 w-4 mr-2" />
              Insert Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
