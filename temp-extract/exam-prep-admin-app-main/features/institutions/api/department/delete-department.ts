import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getDepartmentsQueryOptions } from "./get-deparments";

export const deleteDepartment = ({
  departmentId,
  facultyId,
}: {
  departmentId: string;
  facultyId: string;
}) => {
  return api.delete(`/admin/content/departments/${departmentId}`);
};

type UseDeleteDepartmentOptions = {
  mutationConfig?: MutationConfig<typeof deleteDepartment>;
};

export const useDeleteDepartment = ({
  mutationConfig,
}: UseDeleteDepartmentOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate departments cache
      await queryClient.invalidateQueries({
        queryKey: ["departments"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["departments"],
      });
      // Invalidate universities cache (since departments are nested in faculties in universities)
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
    mutationFn: deleteDepartment,
  });
};
