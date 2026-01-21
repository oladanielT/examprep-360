import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteSession = ({ sessionId }: { sessionId: string }) => {
  return api.delete(`/admin/content/sessions/${sessionId}`);
};

// ========== HOOK ==========
type UseDeleteSessionOptions = {
  mutationConfig?: MutationConfig<typeof deleteSession>;
};

export const useDeleteSession = ({
  mutationConfig,
}: UseDeleteSessionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // Invalidate and refetch sessions queries
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["sessions"],
      });

      // Invalidate modules and courses (sessions nested in modules)
      await queryClient.invalidateQueries({
        queryKey: ["modules"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["modules"],
      });

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
    mutationFn: deleteSession,
  });
};
