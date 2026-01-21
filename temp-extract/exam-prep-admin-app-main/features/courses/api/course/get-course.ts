import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Course } from "./get-courses";

// ========== API CALL ==========
export const getCourse = ({ courseId }: { courseId: string }): Promise<Course> => {
  return api.get(`/admin/content/courses/${courseId}`);
};

// ========== QUERY OPTIONS ==========
export const getCourseQueryOptions = (courseId: string) => {
  return queryOptions({
    queryKey: ["courses", courseId],
    queryFn: () => getCourse({ courseId }),
  });
};

// ========== HOOK ==========
type UseCourseOptions = {
  courseId: string;
  queryConfig?: QueryConfig<typeof getCourseQueryOptions>;
};

export const useCourse = ({ courseId, queryConfig }: UseCourseOptions) => {
  return useQuery({
    ...getCourseQueryOptions(courseId),
    ...(queryConfig as any),
  });
};
