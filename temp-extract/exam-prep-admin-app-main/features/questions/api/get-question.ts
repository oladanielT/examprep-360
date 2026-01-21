import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Question } from "./get-questions";

// ========== API CALL ==========
export const getQuestion = ({ questionId }: { questionId: string }): Promise<Question> => {
  return api.get(`/admin/content/questions/${questionId}`);
};

// ========== QUERY OPTIONS ==========
export const getQuestionQueryOptions = ({ questionId }: { questionId: string }) => {
  return queryOptions({
    queryKey: ["questions", questionId],
    queryFn: () => getQuestion({ questionId }),
    enabled: !!questionId,
  });
};

// ========== HOOK ==========
type UseQuestionOptions = {
  questionId: string;
  queryConfig?: QueryConfig<typeof getQuestionQueryOptions>;
};

export const useQuestion = ({ questionId, queryConfig }: UseQuestionOptions) => {
  return useQuery({
    ...getQuestionQueryOptions({ questionId }),
    ...(queryConfig as any),
  });
};
