import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import {
  University,
  Faculty,
  Department,
} from "@/features/institutions/api/university/get-universities";

// ========== TYPES ==========
export interface Session {
  id: string;
  year: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  sessions?: Session[];
}

export interface DepartmentWithRelations extends Department {
  faculty: Faculty;
  university: University;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  level: number;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department: DepartmentWithRelations;
  modules: Module[];
}

export interface CoursesResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getCourses = ({
  departmentId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  departmentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}): Promise<CoursesResponse> => {
  return api.get(`/admin/content/courses`, {
    params: {
      ...(departmentId && { departmentId }),
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getCoursesQueryOptions = ({
  departmentId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  departmentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}) => {
  return queryOptions({
    queryKey: ["courses", { departmentId, page, limit, sortBy, sortOrder }],
    queryFn: () => getCourses({ departmentId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseCoursesOptions = {
  departmentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getCoursesQueryOptions>;
};

export const useCourses = ({
  departmentId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseCoursesOptions = {}) => {
  return useQuery({
    ...getCoursesQueryOptions({
      departmentId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
