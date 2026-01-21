import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getSubjectsQueryOptions, Subject } from "./get-subjects";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createSubjectInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  examTypeId: z.string().min(1, "Exam Type ID is required"),
});

export type CreateSubjectInput = z.infer<typeof createSubjectInputSchema>;

// ========== API CALL ==========
export const createSubject = ({
  data,
}: {
  data: CreateSubjectInput;
}): Promise<Subject> => {
  return api.post(`/admin/content/subjects`, data);
};

// ========== HOOK ==========
type UseCreateSubjectOptions = {
  mutationConfig?: MutationConfig<typeof createSubject>;
};

export const useCreateSubject = ({
  mutationConfig,
}: UseCreateSubjectOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate and refetch all subject queries immediately
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["subjects"],
      });
      // Invalidate exam-types cache (since subjects are nested in exam types)
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
    mutationFn: createSubject,
  });
};
