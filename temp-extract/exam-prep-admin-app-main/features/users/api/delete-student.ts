import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { MutationConfig } from "@/lib/react-query";
import { getStudentsQueryOptions } from "./get-students";

export const deleteStudent = ({ studentId }: { studentId: string }) => {
  return api.delete(`/admin/student/${studentId}`);
};

type UseDeleteStudentOptions = {
  mutationConfig?: MutationConfig<typeof deleteStudent>;
};

export const useDeleteStudent = ({
  mutationConfig,
}: UseDeleteStudentOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      // Invalidate students cache
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteStudent,
  });
};
