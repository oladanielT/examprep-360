import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getSubjectsQueryOptions, Subject } from "./get-subjects";
import { getSubjectQueryOptions } from "./get-subject";

// ========== SCHEMA ==========
export const updateSubjectInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateSubjectInput = z.infer<typeof updateSubjectInputSchema>;

// ========== API CALL ==========
export const updateSubject = ({
  data,
  subjectId,
}: {
  data: UpdateSubjectInput;
  subjectId: string;
}): Promise<Subject> => {
  return api.patch(`/admin/content/subjects/${subjectId}`, data);
};

// ========== HOOK ==========
type UseUpdateSubjectOptions = {
  mutationConfig?: MutationConfig<typeof updateSubject>;
};

export const useUpdateSubject = ({
  mutationConfig,
}: UseUpdateSubjectOptions = {}) => {
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
    mutationFn: updateSubject,
  });
};
