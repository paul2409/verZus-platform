"use client";

// VERZUS M10.4 RETRY-SAFE REWARD CLAIM MUTATION

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { rewardResourceQueryKeys } from "../../resources";
import { recordRewardTelemetry } from "../../telemetry/reward-telemetry.client";
import type {
  RewardResourceSnapshot,
  RewardResourceSnapshotMap,
} from "../../resources/model/reward-resource.types";
import { postRewardClaim, RewardClaimClientError } from "../api/reward-claim.client";
import type {
  RewardClaimAttempt,
  RewardClaimResult,
  RewardClaimScenario,
} from "../model/reward-claim.types";

function patchRewardCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  result: RewardClaimResult,
): void {
  queryClient.setQueriesData<RewardResourceSnapshot<"inventory">>(
    { queryKey: [rewardResourceQueryKeys.all[0], "inventory"] },
    (previous) =>
      previous
        ? {
            ...previous,
            data: {
              version: result.inventoryVersion,
              items: previous.data.items.map((item) =>
                item.id === result.rewardId ? result.reward : item,
              ),
            },
            meta: { ...previous.meta, freshness: "fresh", fetchedAt: result.claimedAt },
          }
        : previous,
  );

  queryClient.setQueriesData<RewardResourceSnapshot<"progress">>(
    { queryKey: [rewardResourceQueryKeys.all[0], "progress"] },
    (previous) =>
      previous
        ? {
            ...previous,
            data: {
              ...previous.data,
              claimableRewards: previous.data.claimableRewards.filter(
                (item) => item.id !== result.rewardId,
              ),
              track: previous.data.track.map((item) =>
                item.id === result.rewardId ? { ...item, state: "claimed" as const } : item,
              ),
            },
            meta: { ...previous.meta, freshness: "fresh", fetchedAt: result.claimedAt },
          }
        : previous,
  );

  queryClient.setQueriesData<RewardResourceSnapshot<"history">>(
    { queryKey: [rewardResourceQueryKeys.all[0], "history"] },
    (previous) =>
      previous
        ? {
            ...previous,
            data: {
              items: [
                result.historyItem,
                ...previous.data.items.filter((item) => item.id !== result.historyItem.id),
              ],
            },
            meta: { ...previous.meta, freshness: "fresh", fetchedAt: result.claimedAt },
          }
        : previous,
  );
}

export function useRewardClaim(input: { inventoryVersion: number; scenario: RewardClaimScenario }) {
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState<RewardClaimAttempt | null>(null);
  const [lastResult, setLastResult] = useState<RewardClaimResult | null>(null);

  const mutation = useMutation({
    mutationFn: postRewardClaim,
    onSuccess: (result) => {
      recordRewardTelemetry({
        eventName: "reward_claim_succeeded",
        surface: "claim",
        resource: null,
        widget: null,
        rewardId: result.rewardId,
        state: result.replayed ? "replayed" : "claimed",
        errorCode: null,
        requestId: result.requestId,
      });
      patchRewardCaches(queryClient, result);
      setLastResult(result);
      setAttempt(null);
      void queryClient.invalidateQueries({
        queryKey: rewardResourceQueryKeys.all,
        refetchType: "active",
      });
    },
    onError: (error, variables) => {
      const structured = error instanceof RewardClaimClientError ? error : null;
      recordRewardTelemetry({
        eventName: "reward_claim_failed",
        surface: "claim",
        resource: null,
        widget: null,
        rewardId: variables.rewardId,
        state: "error",
        errorCode: structured?.code ?? "REWARD_CLAIM_UNKNOWN",
        requestId: structured?.requestId ?? null,
      });
    },
  });

  const begin = useCallback(
    (rewardId: string) => {
      if (mutation.isPending || input.inventoryVersion <= 0) return;
      const nextAttempt: RewardClaimAttempt = {
        rewardId,
        expectedVersion: input.inventoryVersion,
        idempotencyKey: crypto.randomUUID(),
        scenario: input.scenario,
      };
      recordRewardTelemetry({
        eventName: "reward_claim_started",
        surface: "claim",
        resource: null,
        widget: null,
        rewardId,
        state: "claiming",
        errorCode: null,
        requestId: null,
      });
      setLastResult(null);
      setAttempt(nextAttempt);
      mutation.mutate(nextAttempt);
    },
    [input.inventoryVersion, input.scenario, mutation],
  );

  const retry = useCallback(() => {
    if (!attempt || mutation.isPending) return;
    recordRewardTelemetry({
      eventName: "reward_claim_retry_requested",
      surface: "claim",
      resource: null,
      widget: null,
      rewardId: attempt.rewardId,
      state: "retrying",
      errorCode: null,
      requestId: null,
    });
    mutation.mutate(attempt);
  }, [attempt, mutation]);

  const refreshAndReset = useCallback(() => {
    mutation.reset();
    setAttempt(null);
    setLastResult(null);
    void queryClient.invalidateQueries({ queryKey: rewardResourceQueryKeys.all });
  }, [mutation, queryClient]);

  const dismiss = useCallback(() => {
    mutation.reset();
    setAttempt(null);
    setLastResult(null);
  }, [mutation]);

  const error = mutation.error instanceof RewardClaimClientError ? mutation.error : null;

  return useMemo(
    () => ({
      canClaim: input.inventoryVersion > 0,
      activeRewardId: attempt?.rewardId ?? null,
      isPending: mutation.isPending,
      error,
      result: lastResult,
      begin,
      retry,
      refreshAndReset,
      dismiss,
    }),
    [
      attempt?.rewardId,
      begin,
      dismiss,
      error,
      input.inventoryVersion,
      lastResult,
      mutation.isPending,
      refreshAndReset,
      retry,
    ],
  );
}

export type RewardClaimController = ReturnType<typeof useRewardClaim>;
export type RewardClaimCacheSnapshotMap = RewardResourceSnapshotMap;
