import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Question } from "./get-questions";
import { createQuestionInputSchema } from "./create-question";

// ========== SCHEMA ==========
// Update uses same schema as create, but all fields are optional
export const updateQuestionInputSchema = createQuestionInputSchema.partial();

export type UpdateQuestionInput = z.infer<typeof updateQuestionInputSchema>;

// ========== API CALL ==========
export const updateQuestion = ({
  questionId,
  data,
}: {
  questionId: string;
  data: UpdateQuestionInput;
}): Promise<Question> => {
  return api.patch(`/admin/content/questions/${questionId}`, data);
};

// ========== HOOK ==========
type UseUpdateQuestionOptions = {
  mutationConfig?: MutationConfig<typeof updateQuestion>;
};

export const useUpdateQuestion = ({
  mutationConfig,
}: UseUpdateQuestionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate and refetch all question queries
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
    mutationFn: updateQuestion,
  });
};
