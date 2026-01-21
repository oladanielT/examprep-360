import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Module } from "./get-modules";
import { getModuleQueryOptions } from "./get-module";

// ========== SCHEMA ==========
export const updateModuleInputSchema = z.object({
  name: z.string().min(1, "Module name is required"),
});

export type UpdateModuleInput = z.infer<typeof updateModuleInputSchema>;

// ========== API CALL ==========
export const updateModule = ({
  data,
  moduleId,
}: {
  data: UpdateModuleInput;
  moduleId: string;
}): Promise<Module> => {
  return api.patch(`/admin/content/modules/${moduleId}`, data);
};

// ========== HOOK ==========
type UseUpdateModuleOptions = {
  mutationConfig?: MutationConfig<typeof updateModule>;
};

export const useUpdateModule = ({
  mutationConfig,
}: UseUpdateModuleOptions = {}) => {
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
      // Invalidate courses cache
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
      // Invalidate specific module
      await queryClient.invalidateQueries({
        queryKey: getModuleQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getModuleQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateModule,
  });
};
