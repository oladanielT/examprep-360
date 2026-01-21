import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getFacultiesQueryOptions, Faculty } from "./get-faculties";
import { getFacultyQueryOptions } from "./get-faculty";

// ========== SCHEMA ==========
export const updateFacultyInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateFacultyInput = z.infer<typeof updateFacultyInputSchema>;

// ========== API CALL ==========
export const updateFaculty = ({
  data,
  facultyId,
}: {
  data: UpdateFacultyInput;
  facultyId: string;
}): Promise<Faculty> => {
  return api.patch(`/admin/content/faculties/${facultyId}`, data);
};

// ========== HOOK ==========
type UseUpdateFacultyOptions = {
  mutationConfig?: MutationConfig<typeof updateFaculty>;
};

export const useUpdateFaculty = ({
  mutationConfig,
}: UseUpdateFacultyOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate faculties cache
      await queryClient.invalidateQueries({
        queryKey: ["faculties"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["faculties"],
      });
      // Invalidate universities cache (since faculties are nested in universities)
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });
      // Invalidate specific faculty
      await queryClient.invalidateQueries({
        queryKey: getFacultyQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getFacultyQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateFaculty,
  });
};
