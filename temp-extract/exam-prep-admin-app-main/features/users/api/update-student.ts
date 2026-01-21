import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { getStudentsQueryOptions, Student } from "./get-students";
import { getStudentQueryOptions } from "./get-student";

// ========== SCHEMA ==========
export const updateStudentInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required").optional(),
  academicLevel: z.string().min(1, "Academic level is required").optional(),
  examType: z.string().min(1, "Exam type is required").optional(),
  universityId: z.string().min(1, "University ID is required").optional(),
  facultyId: z.string().min(1, "Faculty ID is required").optional(),
  departmentId: z.string().min(1, "Department ID is required").optional(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentInputSchema>;

// ========== API CALL ==========
export const updateStudent = ({
  data,
  studentId,
}: {
  data: UpdateStudentInput;
  studentId: string;
}): Promise<Student> => {
  return api.patch(`/admin/student/${studentId}`, data);
};

// ========== HOOK ==========
type UseUpdateStudentOptions = {
  mutationConfig?: MutationConfig<typeof updateStudent>;
};

export const useUpdateStudent = ({
  mutationConfig,
}: UseUpdateStudentOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      // Invalidate students cache
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });
      // Invalidate specific student
      queryClient.invalidateQueries({
        queryKey: getStudentQueryOptions(data.id).queryKey,
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateStudent,
  });
};
