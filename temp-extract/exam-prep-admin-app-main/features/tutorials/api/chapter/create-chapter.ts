import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Chapter } from "./get-chapters";

// ========== SCHEMA ==========
const richContentBlockSchema = z.object({
  type: z.enum([
    "text",
    "markdown",
    "latex",
    "image",
    "video",
    "audio",
    "code",
  ]),
  value: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const createChapterInputSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  tutorialId: z.string().min(1, "Tutorial ID is required"),
  content: z
    .array(richContentBlockSchema)
    .min(1, "At least one content block is required"),
  order: z.number().min(1, "Order must be at least 1"),
});

export type CreateChapterInput = z.infer<typeof createChapterInputSchema>;

// ========== API CALL ==========
export const createChapter = (data: CreateChapterInput): Promise<Chapter> => {
  return api.post(`/admin/content/chapters`, data);
};

// ========== HOOK ==========
type UseCreateChapterOptions = {
  mutationConfig?: MutationConfig<typeof createChapter>;
};

export const useCreateChapter = ({
  mutationConfig,
}: UseCreateChapterOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate chapters cache
      await queryClient.invalidateQueries({
        queryKey: ["chapters"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["chapters"],
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createChapter,
  });
};
