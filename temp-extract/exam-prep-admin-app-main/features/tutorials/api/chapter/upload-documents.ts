import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const uploadDocuments = ({
  chapterId,
  documents,
}: {
  chapterId: string;
  documents: File[];
}): Promise<string[]> => {
  const formData = new FormData();
  documents.forEach((document) => {
    formData.append("documents", document);
  });

  return api.post(
    `/admin/content/chapters/${chapterId}/upload-documents`,
    formData
  );
};

// ========== HOOK ==========
type UseUploadDocumentsOptions = {
  mutationConfig?: MutationConfig<typeof uploadDocuments>;
};

export const useUploadDocuments = ({
  mutationConfig,
}: UseUploadDocumentsOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate chapters cache to refresh document lists
      await queryClient.invalidateQueries({
        queryKey: ["chapters"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["chapters"],
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: uploadDocuments,
  });
};
