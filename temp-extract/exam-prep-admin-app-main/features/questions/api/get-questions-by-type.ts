import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface QuestionsByTypeResponse {
  SINGLE_CHOICE: number;
  MULTI_CHOICE: number;
  FILL_IN_BLANK: number;
  ESSAY: number;
  total: number;
}

export interface GetQuestionsByTypeParams {
  examType?: string;
  subject?: string;
  examYear?: number;
  topicId?: string;
  subTopicId?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}

// ========== API CALL ==========
export const getQuestionsByType = (
  params: GetQuestionsByTypeParams = {}
): Promise<QuestionsByTypeResponse> => {
  const queryParams: Record<string, any> = {};

  if (params.examType) queryParams.examType = params.examType;
  if (params.subject) queryParams.subject = params.subject;
  if (params.examYear) queryParams.examYear = params.examYear;
  if (params.topicId) queryParams.topicId = params.topicId;
  if (params.subTopicId) queryParams.subTopicId = params.subTopicId;
  if (params.difficulty) queryParams.difficulty = params.difficulty;

  return api.get(`/admin/content/questions/categorize/by-question-type`, {
    params: queryParams,
  });
};

// ========== QUERY OPTIONS ==========
export const getQuestionsByTypeQueryOptions = (
  params: GetQuestionsByTypeParams = {}
) => {
  return queryOptions({
    queryKey: ["questions", "by-type", params],
    queryFn: () => getQuestionsByType(params),
  });
};

// ========== HOOK ==========
type UseQuestionsByTypeOptions = {
  params?: GetQuestionsByTypeParams;
  queryConfig?: QueryConfig<typeof getQuestionsByTypeQueryOptions>;
};

export const useQuestionsByType = ({
  params = {},
  queryConfig,
}: UseQuestionsByTypeOptions = {}) => {
  return useQuery({
    ...getQuestionsByTypeQueryOptions(params),
    ...(queryConfig as any),
  });
};
