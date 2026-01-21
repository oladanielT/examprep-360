import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getSubTopicsQueryOptions, SubTopic } from "./get-sub-topics";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createSubTopicInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  topicId: z.string().min(1, "Topic ID is required"),
});

export type CreateSubTopicInput = z.infer<typeof createSubTopicInputSchema>;

// ========== API CALL ==========
export const createSubTopic = ({
  data,
}: {
  data: CreateSubTopicInput;
}): Promise<SubTopic> => {
  return api.post(`/admin/content/subtopics`, data);
};

// ========== HOOK ==========
type UseCreateSubTopicOptions = {
  mutationConfig?: MutationConfig<typeof createSubTopic>;
};

export const useCreateSubTopic = ({
  mutationConfig,
}: UseCreateSubTopicOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate subtopics cache
      await queryClient.invalidateQueries({
        queryKey: ["subtopics"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["subtopics"],
      });
      // Invalidate topics cache (since subtopics are nested in topics)
      await queryClient.invalidateQueries({
        queryKey: ["topics"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["topics"],
      });
      // Invalidate subjects cache (since subtopics are nested in subjects)
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
    mutationFn: createSubTopic,
  });
};
