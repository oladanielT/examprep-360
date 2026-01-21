import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Chapter } from "./get-chapters";
import { getChapterQueryOptions } from "./get-chapter";

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

export const updateChapterInputSchema = z
  .object({
    name: z.string().min(1, "Chapter name is required").optional(),
    content: z
      .array(richContentBlockSchema)
      .min(1, "At least one content block is required")
      .optional(),
    order: z.number().min(1).optional(),
  })
  .refine((data) => data.name || data.content || data.order !== undefined, {
    message: "At least one field (name, content, or order) must be provided",
  });

export type UpdateChapterInput = z.infer<typeof updateChapterInputSchema>;

// ========== API CALL ==========
export const updateChapter = ({
  data,
  chapterId,
}: {
  data: UpdateChapterInput;
  chapterId: string;
}): Promise<Chapter> => {
  return api.patch(`/admin/content/chapters/${chapterId}`, data);
};

// ========== HOOK ==========
type UseUpdateChapterOptions = {
  mutationConfig?: MutationConfig<typeof updateChapter>;
};

export const useUpdateChapter = ({
  mutationConfig,
}: UseUpdateChapterOptions = {}) => {
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
      // Invalidate specific chapter
      await queryClient.invalidateQueries({
        queryKey: getChapterQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getChapterQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateChapter,
  });
};
