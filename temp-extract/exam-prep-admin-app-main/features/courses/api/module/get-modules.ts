import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Module {
  id: string;
  name: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ModulesResponse {
  data: Module[];
  meta: Meta;
}

// ========== API CALL ==========
export const getModules = ({
  courseId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  courseId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<ModulesResponse> => {
  return api.get(`/admin/content/modules`, {
    params: {
      courseId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getModulesQueryOptions = ({
  courseId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  courseId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["modules", { courseId, page, limit, sortBy, sortOrder }],
    queryFn: () => getModules({ courseId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseModulesOptions = {
  courseId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getModulesQueryOptions>;
};

export const useModules = ({
  courseId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseModulesOptions) => {
  return useQuery({
    ...getModulesQueryOptions({
      courseId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
