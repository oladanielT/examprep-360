import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Session } from "./get-sessions";

// ========== SCHEMA ==========
export const createSessionInputSchema = z.object({
  year: z.string().min(1, "Year is required"),
  moduleId: z.string().min(1, "Module ID is required"),
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;

// ========== API CALL ==========
export const createSession = (data: CreateSessionInput): Promise<Session> => {
  return api.post(`/admin/content/sessions`, data);
};

// ========== HOOK ==========
type UseCreateSessionOptions = {
  mutationConfig?: MutationConfig<typeof createSession>;
};

export const useCreateSession = ({
  mutationConfig,
}: UseCreateSessionOptions = {}) => {
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

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createSession,
  });
};
