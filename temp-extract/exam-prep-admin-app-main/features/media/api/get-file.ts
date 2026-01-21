import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface FileInfo {
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// ========== SCHEMA ==========
export const getFileInfoInputSchema = z.object({
  publicId: z.string().min(1, "Public ID is required"),
});

export type GetFileInfoInput = z.infer<typeof getFileInfoInputSchema>;

// ========== API CALL ==========
export const getFileInfo = async ({
  publicId,
}: GetFileInfoInput): Promise<FileInfo> => {
  const params = new URLSearchParams();
  params.append("publicId", publicId);
  return api.get(`/admin/content/media/info?${params.toString()}`);
};

// ========== GET FILE INFO HOOKS ==========
type UseGetFileInfoOptions = {
  mutationConfig?: MutationConfig<typeof getFileInfo>;
};

export const useGetFileInfo = ({
  mutationConfig,
}: UseGetFileInfoOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: getFileInfo,
    onSuccess: async (data, ...args) => {
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};

// ========== CONVENIENCE GET FILE INFO HOOKS ==========
export const useGetImageInfo = (
  mutationConfig?: MutationConfig<typeof getFileInfo>
) => {
  const getInfoMutation = useGetFileInfo({ mutationConfig });

  return {
    ...getInfoMutation,
    mutate: (publicId: string) =>
      getInfoMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      getInfoMutation.mutateAsync({
        publicId,
      }),
  };
};

export const useGetVideoInfo = (
  mutationConfig?: MutationConfig<typeof getFileInfo>
) => {
  const getInfoMutation = useGetFileInfo({ mutationConfig });

  return {
    ...getInfoMutation,
    mutate: (publicId: string) =>
      getInfoMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      getInfoMutation.mutateAsync({
        publicId,
      }),
  };
};

export const useGetAudioInfo = (
  mutationConfig?: MutationConfig<typeof getFileInfo>
) => {
  const getInfoMutation = useGetFileInfo({ mutationConfig });

  return {
    ...getInfoMutation,
    mutate: (publicId: string) =>
      getInfoMutation.mutate({
        publicId,
      }),
    mutateAsync: (publicId: string) =>
      getInfoMutation.mutateAsync({
        publicId,
      }),
  };
};
