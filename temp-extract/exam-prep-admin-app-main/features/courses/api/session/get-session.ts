import { queryOptions, useQuery } from "@tanstack/react-query";

import { QueryConfig } from "@/lib/react-query";
import api from "@/lib/api-client";
import { Session } from "./get-sessions";

// ========== API CALL ==========
export const getSession = ({ sessionId }: { sessionId: string }): Promise<Session> => {
  return api.get(`/admin/content/sessions/${sessionId}`);
};

// ========== QUERY OPTIONS ==========
export const getSessionQueryOptions = (sessionId: string) => {
  return queryOptions({
    queryKey: ["sessions", sessionId],
    queryFn: () => getSession({ sessionId }),
  });
};

// ========== HOOK ==========
type UseSessionOptions = {
  sessionId: string;
  queryConfig?: QueryConfig<typeof getSessionQueryOptions>;
};

export const useSession = ({ sessionId, queryConfig }: UseSessionOptions) => {
  return useQuery({
    ...getSessionQueryOptions(sessionId),
    ...(queryConfig as any),
  });
};
