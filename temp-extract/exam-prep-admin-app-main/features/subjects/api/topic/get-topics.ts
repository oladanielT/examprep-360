import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicsResponse {
  data: Topic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getTopics = ({
  subjectId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "asc",
}: {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<TopicsResponse> => {
  return api.get(`/admin/content/topics`, {
    params: {
      subjectId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getTopicsQueryOptions = ({
  subjectId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "asc",
}: {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return queryOptions({
    queryKey: ["topics", { subjectId, page, limit, sortBy, sortOrder }],
    queryFn: () => getTopics({ subjectId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseTopicsOptions = {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  queryConfig?: QueryConfig<typeof getTopicsQueryOptions>;
};

export const useTopics = ({
  subjectId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseTopicsOptions) => {
  return useQuery({
    ...getTopicsQueryOptions({
      subjectId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
