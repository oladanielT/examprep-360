// ===========================================
// FILE: features/media/components/media-upload-dialog.tsx
// Media Upload Dialog Component
// ===========================================
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageIcon, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DropzoneField } from "@/components/custom/custom-dropzone";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useUploadFile,
  useUploadMultipleFiles,
  type FileType,
} from "@/features/media/api/upload-file";
import {
  InputField,
  TextareaField,
} from "@/components/custom/custom-form-field";
import { useUploadHistoryStore } from "@/features/media/stores/upload-history-store";
import { useGetFileInfo, type FileInfo } from "@/features/media/api/get-file";
import { useDeleteFile } from "@/features/media/api/delete-file";

// ========== SCHEMA ==========
const uploadFormSchema = z.object({
  type: z.enum(["image", "video", "audio"], {
    message: "Please select a file type",
  }),
  multiple: z.boolean(),
  folder: z.string().optional(),
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  width: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().positive().optional()
  ),
  height: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().positive().optional()
  ),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

// ========== FILE SIZE LIMITS ==========
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB for logos and question images
  video: 50 * 1024 * 1024, // 50MB for tutorial videos
  audio: 10 * 1024 * 1024, // 10MB for audio explanations
};

// ========== ACCEPT TYPES ==========
const ACCEPT_TYPES = {
  image: {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },
  video: {
    "video/*": [".mp4", ".webm", ".ogg", ".mov"],
  },
  audio: {
    "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
  },
};

// ========== DEFAULT FOLDERS ==========
const DEFAULT_FOLDERS = {
  image: "questions",
  video: "tutorials",
  audio: "questions",
};

// ========== COMPONENT ==========
interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaUploadDialog({
  open,
  onOpenChange,
}: MediaUploadDialogProps) {
  const [fileRejections, setFileRejections] = React.useState<string[]>([]);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("upload");
  const [fileInfoInput, setFileInfoInput] = React.useState("");
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null);
  const [currentPublicId, setCurrentPublicId] = React.useState<string | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    open: boolean;
    publicId: string | null;
  }>({ open: false, publicId: null });

  // Zustand store for upload history
  const { history, addUpload, clearHistory, removeUpload } =
    useUploadHistoryStore();

  const form = useForm({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      type: "image",
      multiple: false,
      folder: "",
      files: [],
      width: undefined,
      height: undefined,
    },
  });

  const fileType = form.watch("type");
  const multiple = form.watch("multiple");
  const files = form.watch("files");

  // ========== MUTATIONS ==========
  const { mutate: uploadSingle, isPending: isSinglePending } = useUploadFile({
    mutationConfig: {
      onSuccess: (data) => {
        const fileName =
          data.filename || data.publicId?.split("/").pop() || "File";
        toast.success("File uploaded successfully!", {
          description: `${fileName} has been uploaded.`,
        });
        // Add to history store
        addUpload(data, false);
        // Reset form
        form.reset();
        setFileRejections([]);
        // Switch to recent tab
        setActiveTab("recent");
      },
      onError: (error: any) => {
        console.error("Upload mutation error:", error);
        const errorMsg =
          error?.data?.message ||
          error?.message ||
          "Failed to upload file. Please try again.";
        const errorDetails = error?.data?.details || error?.data?.error || "";

        toast.error("Upload failed", {
          description: errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg,
        });
      },
    },
  });

  const { mutate: uploadMultiple, isPending: isMultiplePending } =
    useUploadMultipleFiles({
      mutationConfig: {
        onSuccess: (data) => {
          toast.success("Files uploaded successfully!", {
            description: `${
              data.count || data.files?.length
            } file(s) have been uploaded.`,
          });
          // Add to history store
          addUpload(data.files || data, true);
          // Reset form
          form.reset();
          setFileRejections([]);
          // Switch to recent tab
          setActiveTab("recent");
        },
        onError: (error: any) => {
          console.error("Upload multiple mutation error:", error);
          const errorMsg =
            error?.data?.message ||
            error?.message ||
            "Failed to upload files. Please try again.";
          const errorDetails = error?.data?.details || error?.data?.error || "";

          toast.error("Upload failed", {
            description: errorDetails
              ? `${errorMsg}: ${errorDetails}`
              : errorMsg,
          });
        },
      },
    });

  const isPending = isSinglePending || isMultiplePending;

  // ========== GET FILE INFO MUTATION ==========
  const { mutate: getFileInfoMutate, isPending: isGettingFileInfo } =
    useGetFileInfo({
      mutationConfig: {
        onSuccess: (data) => {
          setFileInfo(data);
          toast.success("File info retrieved successfully!");
        },
        onError: (error: any) => {
          toast.error("Failed to get file info", {
            description:
              error?.message || "Could not retrieve file information.",
          });
          setFileInfo(null);
          setCurrentPublicId(null);
        },
      },
    });

  // ========== DELETE FILE MUTATION ==========
  const { mutate: deleteFileMutate, isPending: isDeletingFile } = useDeleteFile(
    {
      mutationConfig: {
        onSuccess: (data, variables) => {
          toast.success("File deleted successfully!");
          // Find and remove from history
          const uploadToRemove = history.find((item) =>
            item.files.some((f) => f.publicId === variables.publicId)
          );
          if (uploadToRemove) {
            removeUpload(uploadToRemove.id);
          }
          // Clear file info if the deleted file was being viewed
          if (currentPublicId === variables.publicId) {
            setFileInfo(null);
            setCurrentPublicId(null);
          }
          // Close confirmation dialog
          setDeleteConfirm({ open: false, publicId: null });
        },
        onError: (error: any) => {
          toast.error("Failed to delete file", {
            description: error?.message || "Could not delete the file.",
          });
          // Close confirmation dialog
          setDeleteConfirm({ open: false, publicId: null });
        },
      },
    }
  );

  // ========== HANDLERS ==========
  const handleClose = () => {
    form.reset();
    setFileRejections([]);
    setCopiedField(null);
    onOpenChange(false);
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleCopyAllUrls = async (files: any[]) => {
    try {
      const urls = files.map((file) => file.secureUrl).join("\n");
      await navigator.clipboard.writeText(urls);
      setCopiedField("allUrls");
      toast.success("All URLs copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URLs");
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.success("Upload history cleared!");
  };

  const handleGetFileInfo = () => {
    if (!fileInfoInput.trim()) {
      toast.error("Please enter a Public ID");
      return;
    }

    let publicId = fileInfoInput.trim();

    // If user pasted a URL, extract the publicId (keep the extension!)
    if (publicId.includes("cloudinary.com") || publicId.includes("http")) {
      try {
        const urlParts = publicId.split("/upload/");
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split("/");
          // Remove version (v1234567890) if present
          const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
          publicId = pathParts.slice(startIndex).join("/");
          // Keep the file extension - API needs it
        }
      } catch (error) {
        toast.error("Failed to parse URL. Please enter a valid Public ID.");
        return;
      }
    }

    setCurrentPublicId(publicId);
    getFileInfoMutate({ publicId });
  };

  const handleDeleteFile = (publicId: string) => {
    setDeleteConfirm({ open: true, publicId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.publicId) {
      deleteFileMutate({ publicId: deleteConfirm.publicId });
    }
  };

  // ✅ FIXED: Typed as 'any' initially to bypass the strict check, then cast to type.
  const onSubmit = (data: any) => {
    const values = data as UploadFormValues;

    console.log("Form submitted with values:", values);
    console.log("Files array:", values.files);
    console.log("First file:", values.files[0]);

    if (!values.files || values.files.length === 0) {
      toast.error("No files selected", {
        description: "Please select at least one file to upload.",
      });
      return;
    }

    if (values.multiple) {
      uploadMultiple({
        files: values.files,
        type: values.type,
        folder: values.folder || DEFAULT_FOLDERS[values.type],
      });
    } else {
      const fileToUpload = values.files[0];
      console.log("Uploading single file:", fileToUpload);

      uploadSingle({
        file: fileToUpload,
        type: values.type,
        folder: values.folder || DEFAULT_FOLDERS[values.type],
        width: values.type === "image" ? values.width : undefined,
        height: values.type === "image" ? values.height : undefined,
      });
    }
  };

  const handleFileTypeChange = (value: FileType) => {
    form.setValue("type", value);
    form.setValue("files", []); // Clear files when type changes
    setFileRejections([]);
  };

  const handleMultipleChange = (checked: boolean) => {
    form.setValue("multiple", checked);
    form.setValue("files", []); // Clear files when multiple changes
    setFileRejections([]);
  };

  // ========== RENDER ==========
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="size-5" />
              Media Manager
            </DialogTitle>
            <DialogDescription>
              Upload, view recent uploads, or get file information.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="shrink-0">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="recent">
                Recent {history.length > 0 && `(${history.length})`}
              </TabsTrigger>
              <TabsTrigger value="file-info">File Info</TabsTrigger>
            </TabsList>

            {/* ========== UPLOAD TAB ========== */}
            <TabsContent
              value="upload"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {/* File Type Selector */}
                  <div className="space-y-3">
                    <Label>File Type *</Label>
                    <RadioGroup
                      value={fileType}
                      onValueChange={handleFileTypeChange}
                      className="flex gap-4"
                      disabled={isPending}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="type-image" />
                        <Label htmlFor="type-image" className="cursor-pointer">
                          Image
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="type-video" />
                        <Label htmlFor="type-video" className="cursor-pointer">
                          Video
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="type-audio" />
                        <Label htmlFor="type-audio" className="cursor-pointer">
                          Audio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Multiple Files Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Upload Multiple Files</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable to upload multiple files at once
                      </p>
                    </div>
                    <Switch
                      checked={multiple}
                      onCheckedChange={handleMultipleChange}
                      disabled={isPending}
                    />
                  </div>

                  {/* Folder Input */}
                  <TextareaField
                    label="Folder (Optional)"
                    placeholder={`Default: ${DEFAULT_FOLDERS[fileType]}`}
                    hint={`Files will be stored in the "${
                      form.watch("folder") || DEFAULT_FOLDERS[fileType]
                    }" folder`}
                    disabled={isPending}
                    {...form.register("folder")}
                  />

                  {/* Conditional Width/Height for Images */}
                  {fileType === "image" && !multiple && (
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Width (Optional)"
                        type="number"
                        placeholder="800"
                        hint="Image width in pixels"
                        disabled={isPending}
                        error={form.formState.errors.width?.message}
                        {...form.register("width")}
                      />
                      <InputField
                        label="Height (Optional)"
                        type="number"
                        placeholder="600"
                        hint="Image height in pixels"
                        disabled={isPending}
                        error={form.formState.errors.height?.message}
                        {...form.register("height")}
                      />
                    </div>
                  )}

                  {/* Dropzone */}
                  <DropzoneField
                    label={multiple ? "Upload Files *" : "Upload File *"}
                    hint={`${fileType.toUpperCase()} files only (max ${Math.round(
                      FILE_SIZE_LIMITS[fileType] / (1024 * 1024)
                    )}MB ${multiple ? "per file" : ""})`}
                    required
                    accept={ACCEPT_TYPES[fileType]}
                    maxSize={FILE_SIZE_LIMITS[fileType]}
                    maxFiles={multiple ? 10 : 1}
                    value={files}
                    onChange={(newFiles) => {
                      form.setValue("files", newFiles, {
                        shouldValidate: true,
                      });
                    }}
                    onDropRejected={(rejections) => {
                      const errors = rejections.map((rejection) => {
                        const errorMessages = rejection.errors
                          .map((err) => err.message)
                          .join(", ");
                        return `${rejection.file.name}: ${errorMessages}`;
                      });
                      setFileRejections(errors);
                      toast.error("Some files were rejected", {
                        description: errors[0],
                      });
                    }}
                    error={
                      form.formState.errors.files?.message ||
                      (fileRejections.length > 0
                        ? "Some files were rejected. Check file type and size."
                        : undefined)
                    }
                    disabled={isPending}
                  />
                </div>

                {/* Upload Actions */}
                <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || files.length === 0}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isPending
                      ? "Uploading..."
                      : `Upload ${multiple ? "Files" : "File"}`}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* ========== RECENT TAB ========== */}
            <TabsContent
              value="recent"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <ImageIcon className="size-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No uploads yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload some files to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((uploadItem) => (
                      <div
                        key={uploadItem.id}
                        className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-green-200 dark:border-green-800 pb-2">
                          <div>
                            <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">
                              {uploadItem.isMultiple
                                ? `${uploadItem.files.length} Files`
                                : uploadItem.files[0]?.publicId
                                    ?.split("/")
                                    .pop()
                                    ?.split(".")[0] || "File"}
                            </h4>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              {new Date(uploadItem.uploadedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {uploadItem.isMultiple && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleCopyAllUrls(uploadItem.files)
                                }
                                className="h-7 text-xs"
                              >
                                <Copy className="size-3 mr-1" />
                                Copy All URLs
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(uploadItem.files, null, 2),
                                  `json-${uploadItem.id}`
                                )
                              }
                              className="h-7 text-xs"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Files Display */}
                        {uploadItem.isMultiple &&
                        uploadItem.files.length > 1 ? (
                          <Accordion
                            type="multiple"
                            className="w-full space-y-2"
                          >
                            {uploadItem.files.map((file, index) => (
                              <AccordionItem
                                key={file.publicId || index}
                                value={`${uploadItem.id}-file-${index}`}
                                className="bg-white dark:bg-gray-900 border border-green-300 dark:border-green-700 rounded-lg px-3"
                              >
                                <AccordionTrigger className="hover:no-underline py-2">
                                  <div className="flex items-center justify-between w-full pr-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full">
                                        <span className="text-[10px] font-semibold text-green-700 dark:text-green-300">
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div className="text-left">
                                        <h5 className="font-medium text-green-900 dark:text-green-100 text-xs">
                                          {file.publicId
                                            ?.split("/")
                                            .pop()
                                            ?.split(".")[0] ||
                                            `file-${index + 1}`}
                                        </h5>
                                        <p className="text-[10px] text-green-700 dark:text-green-300">
                                          {file.format?.toUpperCase()} •{" "}
                                          {(file.bytes / 1024).toFixed(2)} KB
                                          {file.width &&
                                            file.height &&
                                            ` • ${file.width}×${file.height}px`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 pt-1">
                                  <div className="space-y-2 text-[10px]">
                                    <div className="space-y-1">
                                      <label className="font-medium text-green-900 dark:text-green-100">
                                        Secure URL:
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-green-50 dark:bg-gray-950 border border-green-200 dark:border-green-800 rounded text-[9px] break-all font-mono">
                                          {file.secureUrl}
                                        </code>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleCopy(
                                              file.secureUrl,
                                              `${uploadItem.id}-secureUrl-${index}`
                                            )
                                          }
                                          className="h-7 w-7 p-0 shrink-0"
                                        >
                                          {copiedField ===
                                          `${uploadItem.id}-secureUrl-${index}` ? (
                                            <Check className="size-3 text-green-600" />
                                          ) : (
                                            <Copy className="size-3" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleDeleteFile(file.publicId)
                                          }
                                          disabled={isDeletingFile}
                                          className="h-7 w-7 p-0 shrink-0"
                                        >
                                          {isDeletingFile ? (
                                            <Loader2 className="size-3 animate-spin" />
                                          ) : (
                                            <Trash2 className="size-3 text-red-600" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <div className="space-y-2 text-xs">
                            {uploadItem.files[0] && (
                              <>
                                <div className="space-y-1">
                                  <label className="font-medium text-green-900 dark:text-green-100">
                                    Secure URL:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 border border-green-300 dark:border-green-700 rounded text-[10px] break-all font-mono">
                                      {uploadItem.files[0].secureUrl}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleCopy(
                                          uploadItem.files[0].secureUrl,
                                          `${uploadItem.id}-secureUrl`
                                        )
                                      }
                                      className="h-7 w-7 p-0 shrink-0"
                                    >
                                      {copiedField ===
                                      `${uploadItem.id}-secureUrl` ? (
                                        <Check className="size-3 text-green-600" />
                                      ) : (
                                        <Copy className="size-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="font-medium text-green-900 dark:text-green-100">
                                    Public ID:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 border border-green-300 dark:border-green-700 rounded text-[10px] break-all font-mono">
                                      {uploadItem.files[0].publicId}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleCopy(
                                          uploadItem.files[0].publicId,
                                          `${uploadItem.id}-publicId`
                                        )
                                      }
                                      className="h-7 w-7 p-0 shrink-0"
                                    >
                                      {copiedField ===
                                      `${uploadItem.id}-publicId` ? (
                                        <Check className="size-3 text-green-600" />
                                      ) : (
                                        <Copy className="size-3" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleDeleteFile(
                                          uploadItem.files[0].publicId
                                        )
                                      }
                                      disabled={isDeletingFile}
                                      className="h-7 w-7 p-0 shrink-0"
                                    >
                                      {isDeletingFile ? (
                                        <Loader2 className="size-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="size-3 text-red-600" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-200 dark:border-green-800 text-[10px]">
                                  {uploadItem.files[0].format && (
                                    <div>
                                      <span className="font-medium">
                                        Format:
                                      </span>{" "}
                                      {uploadItem.files[0].format.toUpperCase()}
                                    </div>
                                  )}
                                  {uploadItem.files[0].width &&
                                    uploadItem.files[0].height && (
                                      <div>
                                        <span className="font-medium">
                                          Size:
                                        </span>{" "}
                                        {uploadItem.files[0].width}×
                                        {uploadItem.files[0].height}px
                                      </div>
                                    )}
                                  {uploadItem.files[0].bytes && (
                                    <div>
                                      <span className="font-medium">
                                        File Size:
                                      </span>{" "}
                                      {(
                                        uploadItem.files[0].bytes / 1024
                                      ).toFixed(2)}{" "}
                                      KB
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Tab Actions */}
              {history.length > 0 && (
                <div className="flex justify-between gap-3 flex-shrink-0 pt-4 border-t mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearHistory}
                    className="text-xs"
                  >
                    Clear All History
                  </Button>
                  <Button type="button" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* ========== FILE INFO TAB ========== */}
            <TabsContent
              value="file-info"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="space-y-3">
                  <Label>Public ID or URL *</Label>
                  <InputField
                    placeholder="questions/ewobtfz8ogktpuoszjru or paste full URL"
                    value={fileInfoInput}
                    onChange={(e) => setFileInfoInput(e.target.value)}
                    disabled={isGettingFileInfo}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the Cloudinary public ID or paste the full file URL
                  </p>
                  <Button
                    type="button"
                    onClick={handleGetFileInfo}
                    disabled={isGettingFileInfo || !fileInfoInput.trim()}
                    className="w-full"
                  >
                    {isGettingFileInfo && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isGettingFileInfo ? "Getting Info..." : "Get File Info"}
                  </Button>
                </div>

                {/* File Info Display */}
                {fileInfo && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        File Information
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          currentPublicId && handleDeleteFile(currentPublicId)
                        }
                        disabled={isDeletingFile || !currentPublicId}
                      >
                        {isDeletingFile ? (
                          <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 size-3 text-red-600" />
                        )}
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="font-medium text-blue-900 dark:text-blue-100">
                          URL:
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded text-[10px] break-all font-mono">
                            {fileInfo.url}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCopy(fileInfo.url, "fileinfo-url")
                            }
                            className="h-7 w-7 p-0 shrink-0"
                          >
                            {copiedField === "fileinfo-url" ? (
                              <Check className="size-3 text-blue-600" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-medium text-blue-900 dark:text-blue-100">
                          Filename:
                        </label>
                        <code className="block p-2 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded text-[10px] break-all font-mono">
                          {fileInfo.filename}
                        </code>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200 dark:border-blue-800 text-[10px]">
                        {fileInfo.type && (
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {fileInfo.type}
                          </div>
                        )}
                        {fileInfo.size && (
                          <div>
                            <span className="font-medium">Size:</span>{" "}
                            {(fileInfo.size / 1024).toFixed(2)} KB
                          </div>
                        )}
                        {fileInfo.dimensions && (
                          <>
                            <div>
                              <span className="font-medium">Width:</span>{" "}
                              {fileInfo.dimensions.width}px
                            </div>
                            <div>
                              <span className="font-medium">Height:</span>{" "}
                              {fileInfo.dimensions.height}px
                            </div>
                          </>
                        )}
                        {fileInfo.uploadedAt && (
                          <div className="col-span-2">
                            <span className="font-medium">Uploaded:</span>{" "}
                            {new Date(fileInfo.uploadedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info Actions */}
              <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t mt-4">
                <Button type="button" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ open, publicId: deleteConfirm.publicId })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              file from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirm({ open: false, publicId: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeletingFile}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingFile && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {isDeletingFile ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
