import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Tutorial } from "./get-all-tutorials";

// ========== SCHEMA ==========
export const createTutorialInputSchema = z.object({
  name: z.string().min(1, "Tutorial name is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  type: z.enum(["TEXT_TUTORIAL", "VIDEO_TUTORIAL"], {
    message: "Please select a tutorial type",
  }),
});

export type CreateTutorialInput = z.infer<typeof createTutorialInputSchema>;

// ========== API CALL ==========
export const createTutorial = (data: CreateTutorialInput): Promise<Tutorial> => {
  return api.post(`/admin/content/tutorials`, data);
};

// ========== HOOK ==========
type UseCreateTutorialOptions = {
  mutationConfig?: MutationConfig<typeof createTutorial>;
};

export const useCreateTutorial = ({
  mutationConfig,
}: UseCreateTutorialOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate tutorials cache
      await queryClient.invalidateQueries({
        queryKey: ["tutorials"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["tutorials"],
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createTutorial,
  });
};
