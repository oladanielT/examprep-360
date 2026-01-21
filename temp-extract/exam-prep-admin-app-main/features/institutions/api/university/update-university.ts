import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getUniversitiesQueryOptions, University } from "./get-universities";
import { getUniversityQueryOptions } from "./get-university";

// ========== SCHEMA ==========
export const updateUniversityInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
  type: z.enum(["UNIVERSITY", "COLLEGE", "POLYTECHNIC"]),
  imageUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
      "Must be a valid URL"
    ),
});

export type UpdateUniversityInput = z.infer<typeof updateUniversityInputSchema>;

// ========== API CALL ==========
export const updateUniversity = ({
  data,
  universityId,
}: {
  data: UpdateUniversityInput;
  universityId: string;
}): Promise<University> => {
  return api.patch(`/admin/content/universities/${universityId}`, data);
};

// ========== HOOK ==========
type UseUpdateUniversityOptions = {
  mutationConfig?: MutationConfig<typeof updateUniversity>;
};

export const useUpdateUniversity = ({
  mutationConfig,
}: UseUpdateUniversityOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate all universities queries regardless of parameters
      await queryClient.invalidateQueries({
        queryKey: ["universities"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["universities"],
      });

      // Invalidate the specific university details
      await queryClient.invalidateQueries({
        queryKey: getUniversityQueryOptions(data.id).queryKey,
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: getUniversityQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateUniversity,
  });
};
