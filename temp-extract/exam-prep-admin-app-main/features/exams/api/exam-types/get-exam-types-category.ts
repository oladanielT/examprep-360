import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { ExamType } from "./get-all-exam-types";

// ========== API CALL ==========
export const getExamTypesByCategory = (): Promise<{ data: ExamType[] }> => {
  return api.get(`/admin/content/exam-types/categories`);
};

// ========== QUERY OPTIONS ==========
export const getExamTypesByCategoryQueryOptions = () => {
  return queryOptions({
    queryKey: ["exam-types", "categories"],
    queryFn: () => getExamTypesByCategory(),
  });
};

// ========== HOOK ==========
type UseExamTypesByCategoryOptions = {
  category: string;
  queryConfig?: QueryConfig<typeof getExamTypesByCategoryQueryOptions>;
};

export const useExamTypesByCategory = ({
  category,
  queryConfig,
}: UseExamTypesByCategoryOptions) => {
  return useQuery({
    ...getExamTypesByCategoryQueryOptions(),
    ...(queryConfig as any),
  });
};
