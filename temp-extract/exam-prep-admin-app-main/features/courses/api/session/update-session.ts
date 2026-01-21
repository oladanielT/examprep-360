import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getSessionsQueryOptions, Session } from "./get-sessions";
import { getSessionQueryOptions } from "./get-session";

// ========== SCHEMA ==========
export const updateSessionInputSchema = z.object({
  year: z.string().min(1, "Year is required"),
});

export type UpdateSessionInput = z.infer<typeof updateSessionInputSchema>;

// ========== API CALL ==========
export const updateSession = ({
  data,
  sessionId,
}: {
  data: UpdateSessionInput;
  sessionId: string;
}): Promise<Session> => {
  return api.patch(`/admin/content/sessions/${sessionId}`, data);
};

// ========== HOOK ==========
type UseUpdateSessionOptions = {
  mutationConfig?: MutationConfig<typeof updateSession>;
};

export const useUpdateSession = ({
  mutationConfig,
}: UseUpdateSessionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate sessions cache
      await queryClient.invalidateQueries({
        queryKey: ["sessions"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["sessions"],
      });
      // Invalidate universities cache (since sessions are nested in modules)
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });
      // Invalidate specific session
      await queryClient.invalidateQueries({
        queryKey: getSessionQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getSessionQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateSession,
  });
};
