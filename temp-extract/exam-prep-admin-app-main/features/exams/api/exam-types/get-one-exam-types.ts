import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { ExamType } from "./get-all-exam-types";

// ========== API CALL ==========
export const getExamType = ({
  examTypeId,
}: {
  examTypeId: string;
}): Promise<ExamType> => {
  return api.get(`/admin/content/exam-types/${examTypeId}`);
};

// ========== QUERY OPTIONS ==========
export const getExamTypeQueryOptions = (examTypeId: string) => {
  return queryOptions({
    queryKey: ["exam-types", examTypeId],
    queryFn: () => getExamType({ examTypeId }),
  });
};

// ========== HOOK ==========
type UseExamTypeOptions = {
  examTypeId: string;
  queryConfig?: QueryConfig<typeof getExamTypeQueryOptions>;
};

export const useExamType = ({
  examTypeId,
  queryConfig,
}: UseExamTypeOptions) => {
  return useQuery({
    ...getExamTypeQueryOptions(examTypeId),
    ...(queryConfig as any),
  });
};
