import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Department } from "./get-deparments";

// ========== SCHEMA ==========
export const createDepartmentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  facultyId: z.string().min(1, "Faculty ID is required"),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentInputSchema>;

// ========== API CALL ==========
export const createDepartment = (
  data: CreateDepartmentInput
): Promise<Department> => {
  return api.post(`/admin/content/departments`, data);
};

// ========== HOOK ==========
type UseCreateDepartmentOptions = {
  mutationConfig?: MutationConfig<typeof createDepartment>;
};

export const useCreateDepartment = ({
  mutationConfig,
}: UseCreateDepartmentOptions = {}) => {
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
    mutationFn: createDepartment,
  });
};
