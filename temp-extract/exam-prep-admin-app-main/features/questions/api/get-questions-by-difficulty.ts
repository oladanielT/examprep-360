import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";

// ========== TYPES ==========
export interface QuestionsByDifficultyResponse {
  EASY: number;
  MEDIUM: number;
  HARD: number;
  total: number;
}

export interface GetQuestionsByDifficultyParams {
  examType?: string;
  subject?: string;
  examYear?: number;
  topicId?: string;
  subTopicId?: string;
}

// ========== API CALL ==========
export const getQuestionsByDifficulty = (
  params: GetQuestionsByDifficultyParams = {}
): Promise<QuestionsByDifficultyResponse> => {
  const queryParams: Record<string, any> = {};

  if (params.examType) queryParams.examType = params.examType;
  if (params.subject) queryParams.subject = params.subject;
  if (params.examYear) queryParams.examYear = params.examYear;
  if (params.topicId) queryParams.topicId = params.topicId;
  if (params.subTopicId) queryParams.subTopicId = params.subTopicId;

  return api.get(`/admin/content/questions/categorize/by-difficulty`, {
    params: queryParams,
  });
};

// ========== QUERY OPTIONS ==========
export const getQuestionsByDifficultyQueryOptions = (
  params: GetQuestionsByDifficultyParams = {}
) => {
  return queryOptions({
    queryKey: ["questions", "by-difficulty", params],
    queryFn: () => getQuestionsByDifficulty(params),
  });
};

// ========== HOOK ==========
type UseQuestionsByDifficultyOptions = {
  params?: GetQuestionsByDifficultyParams;
  queryConfig?: QueryConfig<typeof getQuestionsByDifficultyQueryOptions>;
};

export const useQuestionsByDifficulty = ({
  params = {},
  queryConfig,
}: UseQuestionsByDifficultyOptions = {}) => {
  return useQuery({
    ...getQuestionsByDifficultyQueryOptions(params),
    ...(queryConfig as any),
  });
};
