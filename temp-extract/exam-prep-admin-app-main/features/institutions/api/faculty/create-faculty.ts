import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getFacultiesQueryOptions, Faculty } from "./get-faculties";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createFacultyInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  universityId: z.string().min(1, "University ID is required"),
});

export type CreateFacultyInput = z.infer<typeof createFacultyInputSchema>;

// ========== API CALL ==========
export const createFaculty = ({
  data,
}: {
  data: CreateFacultyInput;
}): Promise<Faculty> => {
  return api.post(`/admin/content/faculties`, data);
};

// ========== HOOK ==========
type UseCreateFacultyOptions = {
  mutationConfig?: MutationConfig<typeof createFaculty>;
};

export const useCreateFaculty = ({
  mutationConfig,
}: UseCreateFacultyOptions = {}) => {
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
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createFaculty,
  });
};
