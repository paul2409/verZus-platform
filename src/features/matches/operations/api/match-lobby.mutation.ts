// VERZUS M7.5 LOBBY TANSTACK QUERY MUTATION

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitMatchLobbyOperation } from "./match-lobby-api.client";

export function useMatchLobbyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMatchLobbyOperation,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["matches", "operations", result.snapshot.matchId],
      });
    },
  });
}
