import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { SubTopic } from "./get-sub-topics";

export const getSubTopic = ({
  subtopicId,
}: {
  subtopicId: string;
}): Promise<{ data: SubTopic }> => {
  return api.get(`/admin/content/subtopics/${subtopicId}`);
};

export const getSubTopicQueryOptions = (subtopicId: string) => {
  return queryOptions({
    queryKey: ["subtopics", subtopicId],
    queryFn: () => getSubTopic({ subtopicId }),
  });
};

type UseSubTopicOptions = {
  subtopicId: string;
  queryConfig?: QueryConfig<typeof getSubTopicQueryOptions>;
};

export const useSubTopic = ({
  subtopicId,
  queryConfig,
}: UseSubTopicOptions) => {
  return useQuery({
    ...getSubTopicQueryOptions(subtopicId),
    ...(queryConfig as any),
  });
};
