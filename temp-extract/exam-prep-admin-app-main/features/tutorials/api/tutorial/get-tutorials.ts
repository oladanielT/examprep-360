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

export interface TutorialsResponse {
  data: Tutorial[];
  meta: Meta;
}

// ========== API CALL ==========
export const getTutorials = ({
  subjectId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<TutorialsResponse> => {
  return api.get(`/admin/content/tutorials`, {
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
export const getTutorialsQueryOptions = ({
  subjectId,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "DESC",
}: {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["tutorials", { subjectId, page, limit, sortBy, sortOrder }],
    queryFn: () => getTutorials({ subjectId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseTutorialsOptions = {
  subjectId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getTutorialsQueryOptions>;
};

export const useTutorials = ({
  subjectId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseTutorialsOptions) => {
  return useQuery({
    ...getTutorialsQueryOptions({
      subjectId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
