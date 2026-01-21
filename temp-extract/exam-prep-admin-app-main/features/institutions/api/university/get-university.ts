import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { University } from "./get-universities";

export const getUniversity = ({
  universityId,
}: {
  universityId: string;
}): Promise<{ data: University }> => {
  return api.get(`/admin/content/universities/${universityId}`);
};

export const getUniversityQueryOptions = (universityId: string) => {
  return queryOptions({
    queryKey: ["universities", universityId],
    queryFn: () => getUniversity({ universityId }),
  });
};

type UseUniversityOptions = {
  universityId: string;
  queryConfig?: QueryConfig<typeof getUniversityQueryOptions>;
};

export const useUniversity = ({
  universityId,
  queryConfig,
}: UseUniversityOptions) => {
  return useQuery({
    ...getUniversityQueryOptions(universityId),
    ...(queryConfig as any),
  });
};
