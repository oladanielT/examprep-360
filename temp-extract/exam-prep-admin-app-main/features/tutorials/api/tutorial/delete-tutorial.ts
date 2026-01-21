import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteTutorial = ({
  id,
}: {
  id: string;
}): Promise<void> => {
  return api.delete(`/admin/content/tutorials/${id}`);
};

// ========== HOOK ==========
type UseDeleteTutorialOptions = {
  mutationConfig?: MutationConfig<typeof deleteTutorial>;
};

export const useDeleteTutorial = ({
  mutationConfig,
}: UseDeleteTutorialOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (...args) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["tutorials"] });
      // Remove tutorials from cache
      queryClient.removeQueries({ queryKey: ["tutorials"] });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteTutorial,
  });
};
