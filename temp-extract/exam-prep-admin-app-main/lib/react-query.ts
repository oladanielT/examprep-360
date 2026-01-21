import {
  UseMutationOptions,
  DefaultOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

interface ErrorWithResponse {
  response?: {
    status?: number;
  };
}

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount: number, error: unknown) => {
      const err = error as ErrorWithResponse;
      // Don't retry on 4xx errors (client errors)
      if (
        err?.response?.status &&
        err.response.status >= 400 &&
        err.response.status < 500
      ) {
        return false;
      }
      // Retry up to 2 times for network errors and 5xx errors
      return failureCount < 2;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 30,
  },
} satisfies DefaultOptions;

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiFnReturnType<FnType extends (...args: any[]) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey" | "queryFn">;

export type MutationConfig<
  MutationFnType extends (...args: any[]) => Promise<any>
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
/* eslint-enable @typescript-eslint/no-explicit-any */
