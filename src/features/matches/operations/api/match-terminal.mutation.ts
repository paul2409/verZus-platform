"use client";

// VERZUS M7.7 TERMINAL OPERATIONS QUERY AND MUTATION

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import type { MatchOperationState } from "../model/match-operations.types";
import type { MatchTerminalRole } from "../model/match-terminal-operations.types";
import { getMatchTerminalSnapshot, mutateMatchTerminal } from "./match-terminal-api.client";
import { matchOperationsQueryKeys } from "./match-operations.query";

export const matchTerminalQueryKeys = {
  all: ["matches", "operations", "terminal"] as const,
  detail: (matchId: string, seedState: MatchOperationState, role: MatchTerminalRole) =>
    ["matches", "operations", "terminal", matchId, seedState, role] as const,
};

export function matchTerminalQueryOptions(
  matchId: string,
  seedState: MatchOperationState,
  role: MatchTerminalRole,
) {
  return queryOptions({
    queryKey: matchTerminalQueryKeys.detail(matchId, seedState, role),
    queryFn: ({ signal }) => getMatchTerminalSnapshot({ matchId, seedState, role, signal }),
    staleTime: 5_000,
    retry: 1,
  });
}

export function useMatchTerminalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutateMatchTerminal,
    onSuccess: async (result) => {
      queryClient.setQueriesData({ queryKey: matchTerminalQueryKeys.all }, result.snapshot);
      await queryClient.invalidateQueries({ queryKey: matchOperationsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: matchTerminalQueryKeys.all });
    },
  });
}
