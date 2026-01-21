import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { Student } from "./get-students";

export const getStudent = ({
  studentId,
}: {
  studentId: string;
}): Promise<{ data: Student }> => {
  return api.get(`/admin/student/${studentId}`);
};

export const getStudentQueryOptions = (studentId: string) => {
  return queryOptions({
    queryKey: ["students", studentId],
    queryFn: () => getStudent({ studentId }),
  });
};

type UseStudentOptions = {
  studentId: string;
  queryConfig?: QueryConfig<typeof getStudentQueryOptions>;
};

export const useStudent = ({ studentId, queryConfig }: UseStudentOptions) => {
  return useQuery({
    ...getStudentQueryOptions(studentId),
    ...(queryConfig as any),
  });
};
