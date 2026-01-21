import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Tutorial } from "./get-all-tutorials";

// ========== API CALL ==========
export const getTutorial = (id: string): Promise<Tutorial> => {
  return api.get(`/admin/content/tutorials/${id}`);
};

// ========== QUERY OPTIONS ==========
export const getTutorialQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["tutorial", id],
    queryFn: () => getTutorial(id),
  });
};

// ========== HOOK ==========
type UseTutorialOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getTutorialQueryOptions>;
};

export const useTutorial = ({ id, queryConfig }: UseTutorialOptions) => {
  return useQuery<Tutorial>({
    ...getTutorialQueryOptions(id),
    ...(queryConfig as any),
  });
};
