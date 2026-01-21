import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Department {
  id: string;
  name: string;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DepartmentsResponse {
  data: Department[];
  meta: Meta;
}

// ========== API CALL ==========
export const getDepartments = ({
  facultyId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  facultyId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<DepartmentsResponse> => {
  return api.get(`/admin/content/departments`, {
    params: {
      facultyId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getDepartmentsQueryOptions = ({
  facultyId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  facultyId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["departments", { facultyId, page, limit, sortBy, sortOrder }],
    queryFn: () =>
      getDepartments({ facultyId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseDepartmentsOptions = {
  facultyId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getDepartmentsQueryOptions>;
};

export const useDepartments = ({
  facultyId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseDepartmentsOptions) => {
  return useQuery<DepartmentsResponse>({
    ...getDepartmentsQueryOptions({
      facultyId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
