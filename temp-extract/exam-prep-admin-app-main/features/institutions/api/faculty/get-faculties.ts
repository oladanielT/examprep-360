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

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FacultiesResponse {
  data: Faculty[];
  meta: Meta;
}

// ========== API CALL ==========
export const getFaculties = ({
  universityId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  universityId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<FacultiesResponse> => {
  return api.get(`/admin/content/faculties`, {
    params: {
      universityId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getFacultiesQueryOptions = ({
  universityId,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  universityId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["faculties", { universityId, page, limit, sortBy, sortOrder }],
    queryFn: () =>
      getFaculties({ universityId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseFacultiesOptions = {
  universityId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getFacultiesQueryOptions>;
};

export const useFaculties = ({
  universityId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseFacultiesOptions) => {
  return useQuery<FacultiesResponse>({
    ...getFacultiesQueryOptions({
      universityId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
