import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { Department } from "./get-deparments";

export const getDepartment = ({
  departmentId,
}: {
  departmentId: string;
}): Promise<{ data: Department }> => {
  return api.get(`/admin/content/departments/${departmentId}`);
};

export const getDepartmentQueryOptions = (departmentId: string) => {
  return queryOptions({
    queryKey: ["departments", departmentId],
    queryFn: () => getDepartment({ departmentId }),
  });
};

type UseDepartmentOptions = {
  departmentId: string;
  queryConfig?: QueryConfig<typeof getDepartmentQueryOptions>;
};

export const useDepartment = ({
  departmentId,
  queryConfig,
}: UseDepartmentOptions) => {
  return useQuery({
    ...getDepartmentQueryOptions(departmentId),
    ...(queryConfig as any),
  });
};
