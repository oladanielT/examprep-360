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

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
  subTopics?: SubTopic[];
  questions?: any[];
}

export interface Subject {
  id: string;
  name: string;
  examTypeId: string;
  year: number;
  paper?: string;
  textTutorialCount?: number;
  videoTutorialCount?: number;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
  examType?: {
    id: string;
    name: string;
    category: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SubjectsResponse {
  data: Subject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== API CALL ==========
export const getSubjects = ({
  examTypeId,
  year,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  examTypeId?: string;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<SubjectsResponse> => {
  const params: Record<string, any> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  // Only add examTypeId and year if provided
  if (examTypeId) params.examTypeId = examTypeId;
  if (year) params.year = year;

  return api.get(`/admin/content/subjects`, { params });
};

// ========== QUERY OPTIONS ==========
export const getSubjectsQueryOptions = ({
  examTypeId,
  year,
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  examTypeId?: string;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}) => {
  return queryOptions({
    queryKey: [
      "subjects",
      { examTypeId, year, page, limit, sortBy, sortOrder },
    ],
    queryFn: () =>
      getSubjects({ examTypeId, year, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseSubjectsOptions = {
  examTypeId?: string;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getSubjectsQueryOptions>;
};

export const useSubjects = ({
  examTypeId,
  year,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseSubjectsOptions = {}) => {
  return useQuery({
    ...getSubjectsQueryOptions({
      examTypeId,
      year,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
