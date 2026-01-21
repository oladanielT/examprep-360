import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getDepartmentsQueryOptions, Department } from "./get-deparments";
import { getDepartmentQueryOptions } from "./get-department";

// ========== SCHEMA ==========
export const updateDepartmentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentInputSchema>;

// ========== API CALL ==========
export const updateDepartment = ({
  data,
  departmentId,
}: {
  data: UpdateDepartmentInput;
  departmentId: string;
}): Promise<Department> => {
  return api.patch(`/admin/content/departments/${departmentId}`, data);
};

// ========== HOOK ==========
type UseUpdateDepartmentOptions = {
  mutationConfig?: MutationConfig<typeof updateDepartment>;
};

export const useUpdateDepartment = ({
  mutationConfig,
}: UseUpdateDepartmentOptions = {}) => {
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
      // Invalidate specific department
      await queryClient.invalidateQueries({
        queryKey: getDepartmentQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getDepartmentQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateDepartment,
  });
};
