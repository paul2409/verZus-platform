// VERZUS M10.4 REWARD CLAIM DOMAIN TYPES

import type { RewardHistoryItem } from "../../foundation";
import type { RewardInventoryItem } from "../../inventory";

export const rewardClaimScenarios = [
  "normal",
  "slow",
  "error",
  "conflict",
  "response-lost",
  "unavailable",
] as const;

export type RewardClaimScenario = (typeof rewardClaimScenarios)[number];

export type RewardClaimAuditEvent = {
  id: string;
  playerId: string;
  rewardId: string;
  action: "reward_claimed";
  claimReference: string;
  idempotencyKeyHash: string;
  createdAt: string;
};

export type RewardClaimResult = {
  claimId: string;
  claimReference: string;
  rewardId: string;
  inventoryVersion: number;
  claimedAt: string;
  replayed: boolean;
  reward: RewardInventoryItem;
  historyItem: RewardHistoryItem;
  auditEvent: RewardClaimAuditEvent;
  requestId: string;
};

export type RewardClaimAttempt = {
  rewardId: string;
  expectedVersion: number;
  idempotencyKey: string;
  scenario: RewardClaimScenario;
};

export type RewardClaimErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};
