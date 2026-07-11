import { QueryClient } from "@tanstack/react-query";

import { retryDelay, shouldRetryQuery } from "./retry-policy";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
        retryDelay,
        staleTime: 30_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
