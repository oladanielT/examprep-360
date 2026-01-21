import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { getStudentsQueryOptions, Student } from "./get-students";
import api from "@/lib/api-client";

// ========== SCHEMA ==========
export const createStudentInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  academicLevel: z.string().min(1, "Academic level is required"),
  examType: z.string().min(1, "Exam type is required"),
  universityId: z.string().min(1, "University ID is required"),
  facultyId: z.string().min(1, "Faculty ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
});

export type CreateStudentInput = z.infer<typeof createStudentInputSchema>;

// ========== API CALL ==========
export const createStudent = ({
  data,
}: {
  data: CreateStudentInput;
}): Promise<Student> => {
  return api.post(`/admin/student`, data);
};

// ========== HOOK ==========
type UseCreateStudentOptions = {
  mutationConfig?: MutationConfig<typeof createStudent>;
};

export const useCreateStudent = ({
  mutationConfig,
}: UseCreateStudentOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      // Invalidate students cache
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createStudent,
  });
};
