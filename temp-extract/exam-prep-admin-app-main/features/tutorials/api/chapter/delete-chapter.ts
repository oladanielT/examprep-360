import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteChapter = ({
  chapterId,
  tutorialId,
}: {
  chapterId: string;
  tutorialId: string;
}): Promise<void> => {
  return api.delete(`/admin/content/chapters/${chapterId}`);
};

// ========== HOOK ==========
type UseDeleteChapterOptions = {
  mutationConfig?: MutationConfig<typeof deleteChapter>;
};

export const useDeleteChapter = ({
  mutationConfig,
}: UseDeleteChapterOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (...args) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["chapters"] });
      // Remove chapters from cache
      queryClient.removeQueries({ queryKey: ["chapters"] });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteChapter,
  });
};
