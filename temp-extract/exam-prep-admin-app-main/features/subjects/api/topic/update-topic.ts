import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getTopicsQueryOptions, Topic } from "./get-topics";
import { getTopicQueryOptions } from "./get-topic";

// ========== SCHEMA ==========
export const updateTopicInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateTopicInput = z.infer<typeof updateTopicInputSchema>;

// ========== API CALL ==========
export const updateTopic = ({
  data,
  topicId,
}: {
  data: UpdateTopicInput;
  topicId: string;
}): Promise<Topic> => {
  return api.patch(`/admin/content/topics/${topicId}`, data);
};

// ========== HOOK ==========
type UseUpdateTopicOptions = {
  mutationConfig?: MutationConfig<typeof updateTopic>;
};

export const useUpdateTopic = ({
  mutationConfig,
}: UseUpdateTopicOptions = {}) => {
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
      // Invalidate specific topic
      await queryClient.invalidateQueries({
        queryKey: getTopicQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getTopicQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateTopic,
  });
};
