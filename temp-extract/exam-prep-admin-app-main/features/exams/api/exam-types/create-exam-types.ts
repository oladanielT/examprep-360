import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";

import api from "@/lib/api-client";
import { ExamType, getAllExamTypesQueryOptions } from "./get-all-exam-types";

// ========== SCHEMA ==========
export const createExamTypeInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    "Must be a valid URL"
  ),
});

export type CreateExamTypeInput = z.infer<typeof createExamTypeInputSchema>;

// ========== CREATE API CALL ==========
export const createExamType = ({
  data,
}: {
  data: CreateExamTypeInput;
}): Promise<ExamType> => {
  return api.post(`/admin/content/exam-types`, data);
};

// ========== CREATE HOOK ==========
type UseCreateExamTypeOptions = {
  mutationConfig?: MutationConfig<typeof createExamType>;
};

export const useCreateExamType = ({
  mutationConfig,
}: UseCreateExamTypeOptions = {}) => {
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
    mutationFn: createExamType,
  });
};
