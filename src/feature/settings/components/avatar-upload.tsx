import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriangleAlert, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, useUploadAvatar, useRemoveAvatar } from "@/feature/profile/hooks/useProfile";
import { toast } from "sonner";

interface AvatarUploadProps {
  maxSize?: number;
  className?: string;
}

export default function AvatarUpload({
  maxSize = 2 * 1024 * 1024, // 2MB
  className,
}: AvatarUploadProps) {
  const { data: profile } = useProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/*",
    multiple: false,
    onFilesChange: (files) => {
      if (files[0] && files[0].file instanceof File) {
        handleUpload(files[0].file);
      }
    },
  });

  const handleUpload = (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        toast.success("Profile picture uploaded successfully!");
        // Clear files from the upload hook
        if (files[0]) {
          removeFile(files[0].id);
        }
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || "Failed to upload profile picture.";
        toast.error(message);
        // Clear files on error
        if (files[0]) {
          removeFile(files[0].id);
        }
      },
    });
  };

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || profile?.profilePictureUrl;

  const handleRemove = () => {
    if (currentFile) {
      // Remove local preview file
      removeFile(currentFile.id);
    } else if (profile?.profilePictureUrl) {
      // Remove avatar from server
      removeAvatar.mutate(undefined, {
        onSuccess: (data) => {
          const message = data?.message || "Profile picture removed successfully!";
          toast.success(message);
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || error?.message || "Failed to remove profile picture.";
          toast.error(message);
        },
      });
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            "group/avatar relative h-32 w-32 sm:h-40 sm:w-40 lg:h-50 lg:w-50 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/20",
            previewUrl && "border-solid"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps()} className="sr-only" />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="size-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Remove Button - show when file is uploaded or avatar exists */}
        {(currentFile || profile?.profilePictureUrl) && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleRemove}
            disabled={removeAvatar.isPending}
            className="size-6 absolute end-0 top-0 rounded-full"
            aria-label="Remove avatar"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-medium">
          {uploadAvatar.isPending
            ? "Uploading..."
            : removeAvatar.isPending
            ? "Removing..."
            : currentFile || profile?.profilePictureUrl
            ? "Change avatar"
            : "Upload avatar"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG up to {formatBytes(maxSize)}
        </p>
      </div>

      {/* File validation errors - Keep as Alert (critical errors) */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
