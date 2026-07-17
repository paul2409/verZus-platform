// VERZUS M7.6 RESULT, EVIDENCE AND DISPUTE TANSTACK MUTATIONS

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMatchDispute,
  submitMatchResultOperation,
  uploadMatchEvidence,
} from "./match-result-api.client";

function useMatchOperationInvalidation() {
  const queryClient = useQueryClient();
  return async (matchId: string) => {
    await queryClient.invalidateQueries({
      queryKey: ["matches", "operations", matchId],
    });
  };
}

export function useMatchResultMutation() {
  const invalidate = useMatchOperationInvalidation();
  return useMutation({
    mutationFn: submitMatchResultOperation,
    onSuccess: async (result) => invalidate(result.snapshot.matchId),
  });
}

export function useMatchEvidenceMutation() {
  const invalidate = useMatchOperationInvalidation();
  return useMutation({
    mutationFn: uploadMatchEvidence,
    onSuccess: async (result) => invalidate(result.snapshot.matchId),
  });
}

export function useMatchDisputeMutation() {
  const invalidate = useMatchOperationInvalidation();
  return useMutation({
    mutationFn: createMatchDispute,
    onSuccess: async (result) => invalidate(result.snapshot.matchId),
  });
}
