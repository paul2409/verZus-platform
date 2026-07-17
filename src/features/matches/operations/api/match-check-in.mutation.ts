// VERZUS M7.4 CHECK-IN TANSTACK QUERY MUTATION

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitMatchCheckIn } from "./match-check-in-api.client";

export function useMatchCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMatchCheckIn,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["matches", "operations", result.snapshot.matchId],
      });
    },
  });
}
