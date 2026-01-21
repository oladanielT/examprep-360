import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface Department {
  id: string;
  name: string;
  facultyId: string;
  universityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  name: string;
  universityId: string;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
}

export interface University {
  id: string;
  name: string;
  acronym: string;
  type: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
  imageUrl: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
  faculties?: Faculty[];
  departments?: Department[];
}

export interface UniversitiesResponse {
  data: University[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getUniversities = (
  {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "ASC",
    type,
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    type?: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
  } = { page: 1, limit: 10, sortBy: "name", sortOrder: "ASC" }
): Promise<UniversitiesResponse> => {
  return api.get(`/admin/content/universities`, {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(type && { type }),
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getUniversitiesQueryOptions = ({
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
  type,
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  type?: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
} = {}) => {
  return queryOptions({
    queryKey: ["universities", { page, limit, sortBy, sortOrder, type }],
    queryFn: () => getUniversities({ page, limit, sortBy, sortOrder, type }),
  });
};

// ========== HOOK ==========
type UseUniversitiesOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  type?: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
  queryConfig?: QueryConfig<typeof getUniversitiesQueryOptions>;
};

export const useUniversities = ({
  page,
  limit,
  sortBy,
  sortOrder,
  type,
  queryConfig,
}: UseUniversitiesOptions = {}) => {
  return useQuery<UniversitiesResponse>({
    ...getUniversitiesQueryOptions({ page, limit, sortBy, sortOrder, type }),
    ...(queryConfig as any),
  });
};
