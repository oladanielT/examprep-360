import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Course } from "./get-courses";
import { getCourseQueryOptions } from "./get-course";

// ========== SCHEMA ==========
export const updateCourseInputSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
});

export type UpdateCourseInput = z.infer<typeof updateCourseInputSchema>;

// ========== API CALL ==========
export const updateCourse = ({
  data,
  courseId,
}: {
  data: UpdateCourseInput;
  courseId: string;
}): Promise<Course> => {
  return api.patch(`/admin/content/courses/${courseId}`, data);
};

// ========== HOOK ==========
type UseUpdateCourseOptions = {
  mutationConfig?: MutationConfig<typeof updateCourse>;
};

export const useUpdateCourse = ({
  mutationConfig,
}: UseUpdateCourseOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate courses cache
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["courses"],
      });
      // Invalidate universities cache
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });
      // Invalidate specific course
      await queryClient.invalidateQueries({
        queryKey: getCourseQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getCourseQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateCourse,
  });
};
