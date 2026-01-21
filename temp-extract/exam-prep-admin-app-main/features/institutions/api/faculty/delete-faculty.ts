import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getFacultiesQueryOptions } from "./get-faculties";

export const deleteFaculty = ({
  facultyId,
  universityId,
}: {
  facultyId: string;
  universityId: string;
}) => {
  return api.delete(`/admin/content/faculties/${facultyId}`);
};

type UseDeleteFacultyOptions = {
  mutationConfig?: MutationConfig<typeof deleteFaculty>;
};

export const useDeleteFaculty = ({
  mutationConfig,
}: UseDeleteFacultyOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate faculties cache
      await queryClient.invalidateQueries({
        queryKey: ["faculties"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["faculties"],
      });
      // Invalidate universities cache (since faculties are nested in universities)
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
    mutationFn: deleteFaculty,
  });
};
