import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getSubTopicsQueryOptions, SubTopic } from "./get-sub-topics";
import { getSubTopicQueryOptions } from "./get-sub-topic";

// ========== SCHEMA ==========
export const updateSubTopicInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateSubTopicInput = z.infer<typeof updateSubTopicInputSchema>;

// ========== API CALL ==========
export const updateSubTopic = ({
  data,
  subtopicId,
}: {
  data: UpdateSubTopicInput;
  subtopicId: string;
}): Promise<SubTopic> => {
  return api.patch(`/admin/content/subtopics/${subtopicId}`, data);
};

// ========== HOOK ==========
type UseUpdateSubTopicOptions = {
  mutationConfig?: MutationConfig<typeof updateSubTopic>;
};

export const useUpdateSubTopic = ({
  mutationConfig,
}: UseUpdateSubTopicOptions = {}) => {
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
      // Invalidate specific subtopic
      await queryClient.invalidateQueries({
        queryKey: getSubTopicQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getSubTopicQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateSubTopic,
  });
};
