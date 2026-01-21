import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getSubTopicsQueryOptions } from "./get-sub-topics";

export const deleteSubTopic = ({
  subtopicId,
  topicId,
}: {
  subtopicId: string;
  topicId: string;
}) => {
  return api.delete(`/admin/content/subtopics/${subtopicId}`);
};

type UseDeleteSubTopicOptions = {
  mutationConfig?: MutationConfig<typeof deleteSubTopic>;
};

export const useDeleteSubTopic = ({
  mutationConfig,
}: UseDeleteSubTopicOptions = {}) => {
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
    mutationFn: deleteSubTopic,
  });
};
