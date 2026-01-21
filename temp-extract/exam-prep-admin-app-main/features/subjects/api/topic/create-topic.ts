import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getTopicsQueryOptions, Topic } from "./get-topics";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createTopicInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
});

export type CreateTopicInput = z.infer<typeof createTopicInputSchema>;

// ========== API CALL ==========
export const createTopic = ({
  data,
}: {
  data: CreateTopicInput;
}): Promise<Topic> => {
  return api.post(`/admin/content/topics`, data);
};

// ========== HOOK ==========
type UseCreateTopicOptions = {
  mutationConfig?: MutationConfig<typeof createTopic>;
};

export const useCreateTopic = ({
  mutationConfig,
}: UseCreateTopicOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate topics cache
      await queryClient.invalidateQueries({
        queryKey: ["topics"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["topics"],
      });
      // Invalidate subjects cache (since topics are nested in subjects)
      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["subjects"],
      });
      // Invalidate exam-types cache (since subjects are nested in exam types)
      await queryClient.invalidateQueries({
        queryKey: ["exam-types"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["exam-types"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createTopic,
  });
};
