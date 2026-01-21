import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";

import { getUniversitiesQueryOptions, University } from "./get-universities";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createUniversityInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  acronym: z.string().min(1, "Acronym is required"),
  type: z.enum(["UNIVERSITY", "COLLEGE", "POLYTECHNIC"]),
  imageUrl: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "Must be a valid URL"),
});

export type CreateUniversityInput = z.infer<typeof createUniversityInputSchema>;

// ========== API CALL ==========
export const createUniversity = ({
  data,
}: {
  data: CreateUniversityInput;
}): Promise<University> => {
  return api.post(`/admin/content/universities`, data);
};

// ========== HOOK ==========
type UseCreateUniversityOptions = {
  mutationConfig?: MutationConfig<typeof createUniversity>;
};

export const useCreateUniversity = ({
  mutationConfig,
}: UseCreateUniversityOptions = {}) => {
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
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createUniversity,
  });
};
