import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  academicLevel: string;
  examType: string;
  universityId: string;
  facultyId: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getStudents = ({
  examType,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  examType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<StudentsResponse> => {
  const params: Record<string, any> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  // Only add examType if provided
  if (examType) params.examType = examType;

  return api.get(`/admin/student`, { params });
};

// ========== QUERY OPTIONS ==========
export const getStudentsQueryOptions = ({
  examType,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  examType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}) => {
  return queryOptions({
    queryKey: ["students", { examType, page, limit, sortBy, sortOrder }],
    queryFn: () => getStudents({ examType, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseStudentsOptions = {
  examType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getStudentsQueryOptions>;
};

export const useStudents = ({
  examType,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseStudentsOptions = {}) => {
  return useQuery({
    ...getStudentsQueryOptions({
      examType,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
