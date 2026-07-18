// VERZUS M10.4 SERVER-AUTHORITATIVE IDEMPOTENT REWARD CLAIM SERVICE

import type { RewardClaimResult } from "../model/reward-claim.types";
import {
  getRewardClaimReadModel,
  getStoredRewardClaim,
  persistRewardClaim,
} from "./reward-claim.store";

export class RewardClaimServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "RewardClaimServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function buildFingerprint(input: {
  playerId: string;
  rewardId: string;
  expectedVersion: number;
}): string {
  return JSON.stringify(input);
}

export function claimReward(input: {
  playerId: string;
  rewardId: string;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
  now?: Date;
}): RewardClaimResult {
  const now = input.now ?? new Date();
  const fingerprint = buildFingerprint({
    playerId: input.playerId,
    rewardId: input.rewardId,
    expectedVersion: input.expectedVersion,
  });

  try {
    const replay = getStoredRewardClaim(input.idempotencyKey, fingerprint);
    if (replay) return { ...replay, requestId: input.requestId };
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") {
      throw new RewardClaimServiceError({
        code: "REWARD_IDEMPOTENCY_KEY_REUSED",
        message: "This idempotency key was already used for a different claim command.",
        status: 409,
        retryable: false,
      });
    }
    throw error;
  }

  const snapshot = getRewardClaimReadModel();
  if (snapshot.version !== input.expectedVersion) {
    throw new RewardClaimServiceError({
      code: "REWARD_INVENTORY_STALE_VERSION",
      message: "Reward inventory changed. Refresh before starting a new claim.",
      status: 409,
      retryable: true,
    });
  }

  const reward = snapshot.inventory.find((item) => item.id === input.rewardId);
  if (!reward) {
    throw new RewardClaimServiceError({
      code: "REWARD_NOT_FOUND",
      message: "This reward does not exist or is no longer visible.",
      status: 404,
      retryable: false,
    });
  }

  if (reward.state === "claimed") {
    throw new RewardClaimServiceError({
      code: "REWARD_ALREADY_CLAIMED",
      message: "This reward has already been claimed.",
      status: 409,
      retryable: false,
    });
  }

  if (reward.state !== "claimable") {
    const messages = {
      locked: "This reward is still locked.",
      eligible: "This reward is eligible, but its claim window is not open.",
      claiming: "A claim for this reward is already being confirmed.",
      expired: "This reward expired before it could be claimed.",
      revoked: "This reward is no longer eligible for claiming.",
    } as const;

    throw new RewardClaimServiceError({
      code: `REWARD_${reward.state.toUpperCase()}_NOT_CLAIMABLE`,
      message: messages[reward.state as keyof typeof messages] ?? "This reward cannot be claimed.",
      status: 409,
      retryable: reward.state === "claiming",
    });
  }

  try {
    return persistRewardClaim({
      playerId: input.playerId,
      rewardId: input.rewardId,
      idempotencyKey: input.idempotencyKey,
      fingerprint,
      now,
      requestId: input.requestId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "REWARD_NOT_FOUND") {
      throw new RewardClaimServiceError({
        code: "REWARD_NOT_FOUND",
        message: "This reward disappeared before the claim completed.",
        status: 404,
        retryable: false,
      });
    }
    throw error;
  }
}
