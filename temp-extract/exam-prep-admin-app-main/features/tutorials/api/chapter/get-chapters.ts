import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface RichContentBlock {
  type: "text" | "markdown" | "latex" | "image" | "video" | "audio" | "code";
  value: string;
  metadata?: Record<string, any>;
}

export interface ChapterDocument {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  tutorialId: string;
  content: RichContentBlock[];
  order: number;
  documents?: ChapterDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ChaptersResponse {
  data: Chapter[];
  meta: Meta;
}

// ========== API CALL ==========
export const getChapters = ({
  tutorialId,
  page = 1,
  limit = 10,
  sortBy = "order",
  sortOrder = "ASC",
}: {
  tutorialId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<ChaptersResponse> => {
  return api.get(`/admin/content/chapters`, {
    params: {
      tutorialId,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ==========
export const getChaptersQueryOptions = ({
  tutorialId,
  page = 1,
  limit = 10,
  sortBy = "order",
  sortOrder = "ASC",
}: {
  tutorialId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}) => {
  return queryOptions({
    queryKey: ["chapters", { tutorialId, page, limit, sortBy, sortOrder }],
    queryFn: () => getChapters({ tutorialId, page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK ==========
type UseChaptersOptions = {
  tutorialId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getChaptersQueryOptions>;
};

export const useChapters = ({
  tutorialId,
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseChaptersOptions) => {
  return useQuery<ChaptersResponse>({
    ...getChaptersQueryOptions({
      tutorialId,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    ...(queryConfig as any),
  });
};
