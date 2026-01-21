import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getAllExamTypesQueryOptions } from "./get-all-exam-types";

// ========== API CALL ==========
export const deleteExamType = ({ examTypeId }: { examTypeId: string }) => {
  return api.delete(`/admin/content/exam-types/${examTypeId}`);
};

// ========== HOOK ==========
type UseDeleteExamTypeOptions = {
  mutationConfig?: MutationConfig<typeof deleteExamType>;
};

export const useDeleteExamType = ({
  mutationConfig,
}: UseDeleteExamTypeOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // Cancel any in-flight queries for this exam type to prevent 404s
      await queryClient.cancelQueries({ queryKey: ["exam-types", variables.examTypeId] });
      await queryClient.cancelQueries({ queryKey: ["exam-types"] });

      // Remove all related caches when navigating away
      queryClient.removeQueries({ queryKey: ["exam-types", variables.examTypeId] });
      queryClient.removeQueries({ queryKey: ["exam-types"] });

      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteExamType,
  });
};
