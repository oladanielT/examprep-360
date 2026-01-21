import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { Topic } from "./get-topics";

export const getTopic = ({
  topicId,
}: {
  topicId: string;
}): Promise<{ data: Topic }> => {
  return api.get(`/admin/content/topics/${topicId}`);
};

export const getTopicQueryOptions = (topicId: string) => {
  return queryOptions({
    queryKey: ["topics", topicId],
    queryFn: () => getTopic({ topicId }),
  });
};

type UseTopicOptions = {
  topicId: string;
  queryConfig?: QueryConfig<typeof getTopicQueryOptions>;
};

export const useTopic = ({ topicId, queryConfig }: UseTopicOptions) => {
  return useQuery({
    ...getTopicQueryOptions(topicId),
    ...(queryConfig as any),
  });
};
