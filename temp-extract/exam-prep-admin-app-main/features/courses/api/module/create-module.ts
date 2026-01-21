import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Module } from "./get-modules";

// ========== SCHEMA ==========
export const createModuleInputSchema = z.object({
  name: z.string().min(1, "Module name is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

export type CreateModuleInput = z.infer<typeof createModuleInputSchema>;

// ========== API CALL ==========
export const createModule = (data: CreateModuleInput): Promise<Module> => {
  return api.post(`/admin/content/modules`, data);
};

// ========== HOOK ==========
type UseCreateModuleOptions = {
  mutationConfig?: MutationConfig<typeof createModule>;
};

export const useCreateModule = ({
  mutationConfig,
}: UseCreateModuleOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate modules cache
      await queryClient.invalidateQueries({
        queryKey: ["modules"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["modules"],
      });
      // Invalidate courses cache (modules nested in courses)
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["courses"],
      });
      // Invalidate universities cache
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
    mutationFn: createModule,
  });
};
