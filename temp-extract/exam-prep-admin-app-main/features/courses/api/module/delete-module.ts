import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteModule = ({ moduleId }: { moduleId: string }) => {
  return api.delete(`/admin/content/modules/${moduleId}`);
};

// ========== HOOK ==========
type UseDeleteModuleOptions = {
  mutationConfig?: MutationConfig<typeof deleteModule>;
};

export const useDeleteModule = ({
  mutationConfig,
}: UseDeleteModuleOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // Invalidate and refetch modules queries
      await queryClient.invalidateQueries({
        queryKey: ["modules"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["modules"],
      });

      // Invalidate courses (modules nested in courses)
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["courses"],
      });

      // Invalidate universities
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });

      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteModule,
  });
};
