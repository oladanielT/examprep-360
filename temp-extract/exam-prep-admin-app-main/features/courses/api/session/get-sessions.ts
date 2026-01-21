import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Session {
  id: string;
  year: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SessionsResponse {
  data: Session[];
  meta: Meta;
}

// ========== API CALL ==========
export const getSessions = ({
  moduleId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  moduleId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<SessionsResponse> => {
  return api.get(`/admin/content/sessions`, {
    params: {
      moduleId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getSessionsQueryOptions = ({
  moduleId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  moduleId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["sessions", { moduleId, page, limit, sortBy, sortOrder }],
    queryFn: () => getSessions({ moduleId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseSessionsOptions = {
  moduleId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getSessionsQueryOptions>;
};

export const useSessions = ({
  moduleId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseSessionsOptions) => {
  return useQuery({
    ...getSessionsQueryOptions({
      moduleId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
