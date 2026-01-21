import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Chapter } from "./get-chapters";

// ========== API CALL ==========
export const getChapter = (id: string): Promise<Chapter> => {
  return api.get(`/admin/content/chapters/${id}`);
};

// ========== QUERY OPTIONS ==========
export const getChapterQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["chapter", id],
    queryFn: () => getChapter(id),
  });
};

// ========== HOOK ==========
type UseChapterOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getChapterQueryOptions>;
};

export const useChapter = ({ id, queryConfig }: UseChapterOptions) => {
  return useQuery<Chapter>({
    ...getChapterQueryOptions(id),
    ...(queryConfig as any),
  });
};
