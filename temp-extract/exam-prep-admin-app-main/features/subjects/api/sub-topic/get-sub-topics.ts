import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface SubTopic {
  id: string;
  name: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubTopicsResponse {
  data: SubTopic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getSubTopics = ({
  topicId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "asc",
}: {
  topicId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<SubTopicsResponse> => {
  return api.get(`/admin/content/subtopics`, {
    params: {
      topicId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getSubTopicsQueryOptions = ({
  topicId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "asc",
}: {
  topicId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return queryOptions({
    queryKey: ["subtopics", { topicId, page, limit, sortBy, sortOrder }],
    queryFn: () => getSubTopics({ topicId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseSubTopicsOptions = {
  topicId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  queryConfig?: QueryConfig<typeof getSubTopicsQueryOptions>;
};

export const useSubTopics = ({
  topicId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseSubTopicsOptions) => {
  return useQuery({
    ...getSubTopicsQueryOptions({
      topicId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
