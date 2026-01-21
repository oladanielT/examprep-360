import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Tutorial } from "./get-all-tutorials";
import { getTutorialQueryOptions } from "./get-tutorial";

// ========== SCHEMA ==========
export const updateTutorialInputSchema = z.object({
  name: z.string().min(1, "Tutorial name is required"),
  type: z.enum(["TEXT_TUTORIAL", "VIDEO_TUTORIAL"], {
    message: "Please select a tutorial type",
  }),
});

export type UpdateTutorialInput = z.infer<typeof updateTutorialInputSchema>;

// ========== API CALL ==========
export const updateTutorial = ({
  data,
  tutorialId,
}: {
  data: UpdateTutorialInput;
  tutorialId: string;
}): Promise<Tutorial> => {
  return api.patch(`/admin/content/tutorials/${tutorialId}`, data);
};

// ========== HOOK ==========
type UseUpdateTutorialOptions = {
  mutationConfig?: MutationConfig<typeof updateTutorial>;
};

export const useUpdateTutorial = ({
  mutationConfig,
}: UseUpdateTutorialOptions = {}) => {
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
      // Invalidate specific tutorial
      await queryClient.invalidateQueries({
        queryKey: getTutorialQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getTutorialQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateTutorial,
  });
};
