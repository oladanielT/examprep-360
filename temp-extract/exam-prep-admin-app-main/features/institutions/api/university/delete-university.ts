import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getUniversitiesQueryOptions } from "./get-universities";

export const deleteUniversity = ({
  universityId,
}: {
  universityId: string;
}) => {
  return api.delete(`/admin/content/universities/${universityId}`);
};

type UseDeleteUniversityOptions = {
  mutationConfig?: MutationConfig<typeof deleteUniversity>;
};

export const useDeleteUniversity = ({
  mutationConfig,
}: UseDeleteUniversityOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate all universities queries regardless of parameters
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: deleteUniversity,
  });
};
