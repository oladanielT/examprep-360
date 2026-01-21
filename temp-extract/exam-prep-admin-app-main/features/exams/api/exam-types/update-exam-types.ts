import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getAllExamTypesQueryOptions, ExamType } from "./get-all-exam-types";
import api from "@/lib/api-client";

// ========== UPDATE SCHEMA ==========
export const updateExamTypeInputSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});

export type UpdateExamTypeInput = z.infer<typeof updateExamTypeInputSchema>;

// ========== UPDATE API CALL ==========
export const updateExamType = ({
  examTypeId,
  data,
}: {
  examTypeId: string;
  data: UpdateExamTypeInput;
}): Promise<ExamType> => {
  return api.patch(`/admin/content/exam-types/${examTypeId}`, data);
};

// ========== UPDATE HOOK ==========
type UseUpdateExamTypeOptions = {
  mutationConfig?: MutationConfig<typeof updateExamType>;
};

export const useUpdateExamType = ({
  mutationConfig,
}: UseUpdateExamTypeOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      await queryClient.invalidateQueries({
        queryKey: ["exam-types"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["exam-types"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateExamType,
  });
};
