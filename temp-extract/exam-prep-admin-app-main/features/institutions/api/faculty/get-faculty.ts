import { useQuery, queryOptions } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { QueryConfig } from "@/lib/react-query";
import { Faculty } from "./get-faculties";

export const getFaculty = ({
  facultyId,
}: {
  facultyId: string;
}): Promise<{ data: Faculty }> => {
  return api.get(`/admin/content/faculties/${facultyId}`);
};

export const getFacultyQueryOptions = (facultyId: string) => {
  return queryOptions({
    queryKey: ["faculties", facultyId],
    queryFn: () => getFaculty({ facultyId }),
  });
};

type UseFacultyOptions = {
  facultyId: string;
  queryConfig?: QueryConfig<typeof getFacultyQueryOptions>;
};

export const useFaculty = ({ facultyId, queryConfig }: UseFacultyOptions) => {
  return useQuery({
    ...getFacultyQueryOptions(facultyId),
    ...(queryConfig as any),
  });
};
