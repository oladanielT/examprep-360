import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteQuestion = ({ questionId }: { questionId: string }): Promise<void> => {
  return api.delete(`/admin/content/questions/${questionId}`);
};

// ========== HOOK ==========
type UseDeleteQuestionOptions = {
  mutationConfig?: MutationConfig<typeof deleteQuestion>;
};

export const useDeleteQuestion = ({
  mutationConfig,
}: UseDeleteQuestionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate all question-related queries
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["questions"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: deleteQuestion,
  });
};
