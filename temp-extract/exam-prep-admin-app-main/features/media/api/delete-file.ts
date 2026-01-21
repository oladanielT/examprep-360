import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface DeleteMultipleResponse {
  deleted: number;
  failed: number;
  message: string;
}

// ========== SCHEMA ==========
export const deleteFileInputSchema = z.object({
  publicId: z.string().min(1, "Public ID is required"),
});

export type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

export const deleteMultipleFilesInputSchema = z.object({
  publicIds: z
    .array(z.string().min(1, "Public ID is required"))
    .min(1, "At least one public ID is required"),
});

export type DeleteMultipleFilesInput = z.infer<
  typeof deleteMultipleFilesInputSchema
>;

// ========== API CALL ==========
export const deleteFile = async ({
  publicId,
}: DeleteFileInput): Promise<DeleteResponse> => {
  return api.delete(`/admin/content/media/${publicId}`);
};

export const deleteMultipleFiles = async ({
  publicIds,
}: DeleteMultipleFilesInput): Promise<DeleteMultipleResponse> => {
  return api.post(`/admin/content/media/delete-multiple`, {
    publicIds,
  });
};

// ========== DELETE FILE HOOKS ==========
type UseDeleteFileOptions = {
  mutationConfig?: MutationConfig<typeof deleteFile>;
};

export const useDeleteFile = ({
  mutationConfig,
}: UseDeleteFileOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: async (data, ...args) => {
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};

type UseDeleteMultipleFilesOptions = {
  mutationConfig?: MutationConfig<typeof deleteMultipleFiles>;
};

export const useDeleteMultipleFiles = ({
  mutationConfig,
}: UseDeleteMultipleFilesOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: deleteMultipleFiles,
    onSuccess: async (data, ...args) => {
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};

// ========== CONVENIENCE DELETE HOOKS ==========
export const useDeleteImage = (
  mutationConfig?: MutationConfig<typeof deleteFile>
) => {
  const deleteMutation = useDeleteFile({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicId: string) =>
      deleteMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      deleteMutation.mutateAsync({
        publicId,
      }),
  };
};

export const useDeleteVideo = (
  mutationConfig?: MutationConfig<typeof deleteFile>
) => {
  const deleteMutation = useDeleteFile({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicId: string) =>
      deleteMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      deleteMutation.mutateAsync({
        publicId,
      }),
  };
};

export const useDeleteAudio = (
  mutationConfig?: MutationConfig<typeof deleteFile>
) => {
  const deleteMutation = useDeleteFile({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicId: string) =>
      deleteMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      deleteMutation.mutateAsync({
        publicId,
      }),
  };
};

export const useDeleteMultipleImages = (
  mutationConfig?: MutationConfig<typeof deleteMultipleFiles>
) => {
  const deleteMutation = useDeleteMultipleFiles({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicIds: string[]) =>
      deleteMutation.mutate({
        publicIds,
      }),
    mutateAsync: (publicIds: string[]) =>
      deleteMutation.mutateAsync({
        publicIds,
      }),
  };
};

export const useDeleteMultipleVideos = (
  mutationConfig?: MutationConfig<typeof deleteMultipleFiles>
) => {
  const deleteMutation = useDeleteMultipleFiles({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicIds: string[]) =>
      deleteMutation.mutate({
        publicIds,
      }),
    mutateAsync: (publicIds: string[]) =>
      deleteMutation.mutateAsync({
        publicIds,
      }),
  };
};

export const useDeleteMultipleAudios = (
  mutationConfig?: MutationConfig<typeof deleteMultipleFiles>
) => {
  const deleteMutation = useDeleteMultipleFiles({ mutationConfig });

  return {
    ...deleteMutation,
    mutate: (publicIds: string[]) =>
      deleteMutation.mutate({
        publicIds,
      }),
    mutateAsync: (publicIds: string[]) =>
      deleteMutation.mutateAsync({
        publicIds,
      }),
  };
};
