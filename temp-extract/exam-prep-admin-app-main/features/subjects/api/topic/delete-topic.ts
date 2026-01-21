import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getTopicsQueryOptions } from "./get-topics";

export const deleteTopic = ({
  topicId,
  subjectId,
}: {
  topicId: string;
  subjectId: string;
}) => {
  return api.delete(`/admin/content/topics/${topicId}`);
};

type UseDeleteTopicOptions = {
  mutationConfig?: MutationConfig<typeof deleteTopic>;
};

export const useDeleteTopic = ({
  mutationConfig,
}: UseDeleteTopicOptions = {}) => {
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
    mutationFn: deleteTopic,
  });
};
