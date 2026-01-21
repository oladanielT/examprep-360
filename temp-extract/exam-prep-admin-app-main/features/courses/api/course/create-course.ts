import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Course } from "./get-courses";

// ========== SCHEMA ==========
export const createCourseInputSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  level: z.number().min(100, "Level must be at least 100"),
  departmentId: z.string().min(1, "Department ID is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseInputSchema>;

// ========== API CALL ==========
export const createCourse = (data: CreateCourseInput): Promise<Course> => {
  return api.post(`/admin/content/courses`, data);
};

// ========== HOOK ==========
type UseCreateCourseOptions = {
  mutationConfig?: MutationConfig<typeof createCourse>;
};

export const useCreateCourse = ({
  mutationConfig,
}: UseCreateCourseOptions = {}) => {
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
      // Invalidate universities cache (courses nested in departments)
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createCourse,
  });
};
