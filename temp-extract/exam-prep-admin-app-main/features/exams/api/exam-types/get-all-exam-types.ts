import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface ExamType {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  subjects: any[];
}

export interface ExamTypesResponse {
  data: ExamType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getAllExamTypes = (
  {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "ASC",
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  } = { page: 1, limit: 10, sortBy: "name", sortOrder: "ASC" }
): Promise<ExamTypesResponse> => {
  return api.get(`/admin/content/exam-types`, {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getAllExamTypesQueryOptions = ({
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}) => {
  return queryOptions({
    queryKey: ["exam-types", { page, limit, sortBy, sortOrder }],
    queryFn: () => getAllExamTypes({ page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseAllExamTypesOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getAllExamTypesQueryOptions>;
};

export const useAllExamTypes = ({
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseAllExamTypesOptions = {}) => {
  return useQuery<ExamTypesResponse>({
    ...getAllExamTypesQueryOptions({ page, limit, sortBy, sortOrder }),
    ...(queryConfig as any),
  });
};
