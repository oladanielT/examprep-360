import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const removeDocument = ({
  chapterId,
  documentIndex,
}: {
  chapterId: string;
  documentIndex: number;
}): Promise<void> => {
  return api.delete(
    `/admin/content/chapters/${chapterId}/documents/${documentIndex}`
  );
};

// ========== HOOK ==========
type UseRemoveDocumentOptions = {
  mutationConfig?: MutationConfig<typeof removeDocument>;
};

export const useRemoveDocument = ({
  mutationConfig,
}: UseRemoveDocumentOptions = {}) => {
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
    mutationFn: removeDocument,
  });
};
