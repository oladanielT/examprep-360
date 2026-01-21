import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { Subject } from "./get-subjects";

export const getSubject = ({
  subjectId,
}: {
  subjectId: string;
}): Promise<Subject> => {
  return api.get(`/admin/content/subjects/${subjectId}`);
};

export const getSubjectQueryOptions = (subjectId: string) => {
  return queryOptions({
    queryKey: ["subjects", subjectId],
    queryFn: () => getSubject({ subjectId }),
  });
};

type UseSubjectOptions = {
  subjectId: string;
  queryConfig?: QueryConfig<typeof getSubjectQueryOptions>;
};

export const useSubject = ({ subjectId, queryConfig }: UseSubjectOptions) => {
  return useQuery({
    ...getSubjectQueryOptions(subjectId),
    ...(queryConfig as any),
  });
};
