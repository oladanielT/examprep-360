import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";

export const deleteSubject = ({
  subjectId,
  examTypeId,
  year,
}: {
  subjectId: string;
  examTypeId: string;
  year: number;
}) => {
  return api.delete(`/admin/content/subjects/${subjectId}`);
};

type UseDeleteSubjectOptions = {
  mutationConfig?: MutationConfig<typeof deleteSubject>;
};

export const useDeleteSubject = ({
  mutationConfig,
}: UseDeleteSubjectOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // Cancel any in-flight queries for this subject to prevent 404s
      await queryClient.cancelQueries({ queryKey: ["subjects", variables.subjectId] });
      await queryClient.cancelQueries({ queryKey: ["subjects"] });

      // Remove all related caches when navigating away
      queryClient.removeQueries({ queryKey: ["subjects", variables.subjectId] });
      queryClient.removeQueries({ queryKey: ["subjects"] });
      queryClient.removeQueries({ queryKey: ["topics"] });
      queryClient.removeQueries({ queryKey: ["subtopics"] });

      // Remove exam-types cache to refresh the table
      queryClient.removeQueries({ queryKey: ["exam-types"] });

      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteSubject,
  });
};
