import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== API CALL ==========
export const deleteCourse = ({ courseId }: { courseId: string }) => {
  return api.delete(`/admin/content/courses/${courseId}`);
};

// ========== HOOK ==========
type UseDeleteCourseOptions = {
  mutationConfig?: MutationConfig<typeof deleteCourse>;
};

export const useDeleteCourse = ({
  mutationConfig,
}: UseDeleteCourseOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // Invalidate and refetch courses queries
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["courses"],
      });

      // Invalidate universities (courses nested in departments)
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });

      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteCourse,
  });
};
