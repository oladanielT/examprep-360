"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { queryConfig } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const AllProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  // ✅ Create persister to save cache to localStorage
  const [persister] = React.useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : null,
      key: "REACT_QUERY_OFFLINE_CACHE", // localStorage key
    })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist queries that we want to keep
            const queryKey = query.queryKey[0];
            return queryKey === "admin"; // Persist admin query
          },
        },
      }}
    >
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};

export default AllProvider;
