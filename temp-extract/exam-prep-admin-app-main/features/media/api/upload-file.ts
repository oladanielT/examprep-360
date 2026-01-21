import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export type FileType = "image" | "video" | "audio";

export interface UploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
  filename?: string;
  size?: number;
  type?: FileType;
  uploadedAt?: string;
}

// ========== SCHEMA ==========
export const uploadFileInputSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  type: z.enum(["image", "video", "audio"]),
  folder: z.string().optional(),
  // Image-specific options
  width: z.number().optional(),
  height: z.number().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileInputSchema>;

export const uploadMultipleFilesInputSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  type: z.enum(["image", "video", "audio"]),
  folder: z.string().optional(),
});

export type UploadMultipleFilesInput = z.infer<
  typeof uploadMultipleFilesInputSchema
>;

export interface MultipleUploadResponse {
  files: UploadResponse[];
  count: number;
}

// ========== HELPERS ==========
const getUploadEndpoint = (
  type: FileType,
  folder?: string,
  options?: { width?: number; height?: number }
): string => {
  const baseUrl = "/admin/content/media/upload";

  switch (type) {
    case "image": {
      const params = new URLSearchParams();
      params.append("folder", folder || "questions");
      if (options?.width) params.append("width", options.width.toString());
      if (options?.height) params.append("height", options.height.toString());
      return `${baseUrl}/image?${params.toString()}`;
    }
    case "video":
      return `${baseUrl}/video?folder=${folder || "tutorials"}`;
    case "audio":
      return `${baseUrl}/audio?folder=${folder || "questions"}`;
  }
};

const getMultipleUploadEndpoint = (type: FileType, folder?: string): string => {
  const params = new URLSearchParams();
  params.append("folder", folder || "mixed");
  params.append("type", type);
  return `/admin/content/media/upload/multiple?${params.toString()}`;
};

// ========== API CALL ==========
export const uploadFile = async ({
  file,
  type,
  folder,
  width,
  height,
}: UploadFileInput): Promise<UploadResponse> => {
  console.log("uploadFile called with:", { file, type, folder, width, height });

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  if (!(file instanceof File)) {
    throw new Error("Invalid file object");
  }

  if (!file.name) {
    throw new Error("File name is missing");
  }

  if (file.size === 0) {
    throw new Error("File is empty");
  }

  console.log("File object:", file);
  console.log("File details:", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  });

  const endpoint = getUploadEndpoint(type, folder, { width, height });
  console.log("Upload endpoint:", endpoint);

  const formData = new FormData();
  formData.append("file", file, file.name);

  console.log("FormData created, file appended");

  // Log FormData contents for debugging
  for (const [key, value] of formData.entries()) {
    console.log(`FormData entry: ${key} =`, value);
  }

  try {
    return await api.post(endpoint, formData);
  } catch (error: any) {
    console.error("Upload error:", error);
    console.error("Error response:", error.data);
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
    throw error;
  }
};

export const uploadMultipleFiles = async ({
  files,
  type,
  folder,
}: UploadMultipleFilesInput): Promise<MultipleUploadResponse> => {
  const endpoint = getMultipleUploadEndpoint(type, folder);
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(endpoint, formData);
};

// ========== HOOK ==========
type UseUploadFileOptions = {
  mutationConfig?: MutationConfig<typeof uploadFile>;
};

export const useUploadFile = ({
  mutationConfig,
}: UseUploadFileOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: async (data, ...args) => {
      // Call custom onSuccess if provided
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};

// ========== MULTIPLE FILES HOOK ==========
type UseUploadMultipleFilesOptions = {
  mutationConfig?: MutationConfig<typeof uploadMultipleFiles>;
};

export const useUploadMultipleFiles = ({
  mutationConfig,
}: UseUploadMultipleFilesOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: uploadMultipleFiles,
    onSuccess: async (data, ...args) => {
      // Call custom onSuccess if provided
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};

// ========== CONVENIENCE HOOKS ==========
export const useUploadImage = (
  mutationConfig?: MutationConfig<typeof uploadFile>
) => {
  const uploadMutation = useUploadFile({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (file: File, folder?: string, width?: number, height?: number) =>
      uploadMutation.mutate({
        file,
        type: "image",
        folder: folder || "questions",
        width: width || 800,
        height: height || 600,
      }),
    mutateAsync: (
      file: File,
      folder?: string,
      width?: number,
      height?: number
    ) =>
      uploadMutation.mutateAsync({
        file,
        type: "image",
        folder: folder || "questions",
        width: width || 800,
        height: height || 600,
      }),
  };
};

export const useUploadVideo = (
  mutationConfig?: MutationConfig<typeof uploadFile>
) => {
  const uploadMutation = useUploadFile({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (file: File, folder?: string) =>
      uploadMutation.mutate({
        file,
        type: "video",
        folder: folder || "tutorials",
      }),
    mutateAsync: (file: File, folder?: string) =>
      uploadMutation.mutateAsync({
        file,
        type: "video",
        folder: folder || "tutorials",
      }),
  };
};

export const useUploadAudio = (
  mutationConfig?: MutationConfig<typeof uploadFile>
) => {
  const uploadMutation = useUploadFile({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (file: File, folder?: string) =>
      uploadMutation.mutate({
        file,
        type: "audio",
        folder: folder || "questions",
      }),
    mutateAsync: (file: File, folder?: string) =>
      uploadMutation.mutateAsync({
        file,
        type: "audio",
        folder: folder || "questions",
      }),
  };
};

// ========== CONVENIENCE HOOKS FOR MULTIPLE FILES ==========
export const useUploadMultipleImages = (
  mutationConfig?: MutationConfig<typeof uploadMultipleFiles>
) => {
  const uploadMutation = useUploadMultipleFiles({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (files: File[], folder?: string) =>
      uploadMutation.mutate({
        files,
        type: "image",
        folder: folder || "questions",
      }),
    mutateAsync: (files: File[], folder?: string) =>
      uploadMutation.mutateAsync({
        files,
        type: "image",
        folder: folder || "questions",
      }),
  };
};

export const useUploadMultipleVideos = (
  mutationConfig?: MutationConfig<typeof uploadMultipleFiles>
) => {
  const uploadMutation = useUploadMultipleFiles({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (files: File[], folder?: string) =>
      uploadMutation.mutate({
        files,
        type: "video",
        folder: folder || "tutorials",
      }),
    mutateAsync: (files: File[], folder?: string) =>
      uploadMutation.mutateAsync({
        files,
        type: "video",
        folder: folder || "tutorials",
      }),
  };
};

export const useUploadMultipleAudios = (
  mutationConfig?: MutationConfig<typeof uploadMultipleFiles>
) => {
  const uploadMutation = useUploadMultipleFiles({ mutationConfig });

  return {
    ...uploadMutation,
    mutate: (files: File[], folder?: string) =>
      uploadMutation.mutate({
        files,
        type: "audio",
        folder: folder || "questions",
      }),
    mutateAsync: (files: File[], folder?: string) =>
      uploadMutation.mutateAsync({
        files,
        type: "audio",
        folder: folder || "questions",
      }),
  };
};
