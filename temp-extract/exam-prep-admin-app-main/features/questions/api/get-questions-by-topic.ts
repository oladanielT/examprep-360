import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface TopicQuestionCount {
  topicId: string;
  topicName: string;
  count: number;
  subTopics?: {
    subTopicId: string;
    subTopicName: string;
    count: number;
  }[];
}

export interface QuestionsByTopicResponse {
  data: TopicQuestionCount[];
  total: number;
}

export interface GetQuestionsByTopicParams {
  examType?: string;
  subject?: string;
  examYear?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

// ========== API CALL ==========
export const getQuestionsByTopic = (
  params: GetQuestionsByTopicParams = {}
): Promise<QuestionsByTopicResponse> => {
  const queryParams: Record<string, any> = {};

  if (params.examType) queryParams.examType = params.examType;
  if (params.subject) queryParams.subject = params.subject;
  if (params.examYear) queryParams.examYear = params.examYear;
  if (params.difficulty) queryParams.difficulty = params.difficulty;

  return api.get(`/admin/content/questions/categorize/by-topic`, {
    params: queryParams,
  });
};

// ========== QUERY OPTIONS ==========
export const getQuestionsByTopicQueryOptions = (
  params: GetQuestionsByTopicParams = {}
) => {
  return queryOptions({
    queryKey: ["questions", "by-topic", params],
    queryFn: () => getQuestionsByTopic(params),
  });
};

// ========== HOOK ==========
type UseQuestionsByTopicOptions = {
  params?: GetQuestionsByTopicParams;
  queryConfig?: QueryConfig<typeof getQuestionsByTopicQueryOptions>;
};

export const useQuestionsByTopic = ({
  params = {},
  queryConfig,
}: UseQuestionsByTopicOptions = {}) => {
  return useQuery({
    ...getQuestionsByTopicQueryOptions(params),
    ...(queryConfig as any),
  });
};
