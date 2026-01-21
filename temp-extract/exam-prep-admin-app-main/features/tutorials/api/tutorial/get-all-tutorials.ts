import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Subject } from "@/features/subjects/api/subject/get-subjects";

// ========== TYPES ==========
export interface Tutorial {
  id: string;
  name: string;
  subjectId: string;
  type: "TEXT_TUTORIAL" | "VIDEO_TUTORIAL";
  chapterCount: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
  tutorialImages: any;
  tutorialVideos: any;
  tutorialAudios: any;
  subject?: Subject;
  chapters?: any[];
  testQuestions?: any[];
  _count?: {
    chapters: number;
  };
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AllTutorialsResponse {
  data: Tutorial[];
  meta: Meta;
}

// ========== API CALL ==========
export const getAllTutorials = ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
  type,
  search,
  subjectId,
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  type?: "TEXT_TUTORIAL" | "VIDEO_TUTORIAL";
  search?: string;
  subjectId?: string;
} = {}): Promise<AllTutorialsResponse> => {
  return api.get(`/admin/content/tutorials`, {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(type && { type }),
      ...(search && { search }),
      ...(subjectId && { subjectId }),
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getAllTutorialsQueryOptions = ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
  type,
  search,
  subjectId,
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  type?: "TEXT_TUTORIAL" | "VIDEO_TUTORIAL";
  search?: string;
  subjectId?: string;
} = {}) => {
  return queryOptions({
    queryKey: ["tutorials", "all", { page, limit, sortBy, sortOrder, type, search, subjectId }],
    queryFn: () => getAllTutorials({ page, limit, sortBy, sortOrder, type, search, subjectId }),
  });
};

// ========== HOOK ==========
type UseAllTutorialsOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  type?: "TEXT_TUTORIAL" | "VIDEO_TUTORIAL";
  search?: string;
  subjectId?: string;
  queryConfig?: QueryConfig<typeof getAllTutorialsQueryOptions>;
};

export const useAllTutorials = ({
  page,
  limit,
  sortBy,
  sortOrder,
  type,
  search,
  subjectId,
  queryConfig,
}: UseAllTutorialsOptions = {}) => {
  return useQuery<AllTutorialsResponse>({
    ...getAllTutorialsQueryOptions({ page, limit, sortBy, sortOrder, type, search, subjectId }),
    ...(queryConfig as any),
  });
};
