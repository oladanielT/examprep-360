import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Module } from "./get-modules";

// ========== API CALL ==========
export const getModule = ({ moduleId }: { moduleId: string }): Promise<Module> => {
  return api.get(`/admin/content/modules/${moduleId}`);
};

// ========== QUERY OPTIONS ==========
export const getModuleQueryOptions = (moduleId: string) => {
  return queryOptions({
    queryKey: ["modules", moduleId],
    queryFn: () => getModule({ moduleId }),
  });
};

// ========== HOOK ==========
type UseModuleOptions = {
  moduleId: string;
  queryConfig?: QueryConfig<typeof getModuleQueryOptions>;
};

export const useModule = ({ moduleId, queryConfig }: UseModuleOptions) => {
  return useQuery({
    ...getModuleQueryOptions(moduleId),
    ...(queryConfig as any),
  });
};
