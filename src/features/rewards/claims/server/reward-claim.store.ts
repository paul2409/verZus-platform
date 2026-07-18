// VERZUS M10.4 REFRESH-PERSISTENT REWARD CLAIM STORE

import { createHash, randomUUID } from "node:crypto";

import { rewardsFoundationMock, type RewardHistoryItem } from "../../foundation";
import { rewardInventoryMock, type RewardInventoryItem } from "../../inventory";
import type { RewardClaimAuditEvent, RewardClaimResult } from "../model/reward-claim.types";

export type RewardClaimReadModel = {
  version: number;
  inventory: RewardInventoryItem[];
  history: RewardHistoryItem[];
  auditEvents: RewardClaimAuditEvent[];
};

type StoredClaim = {
  fingerprint: string;
  result: RewardClaimResult;
};

type RewardClaimStore = RewardClaimReadModel & {
  claimsByIdempotencyKey: Map<string, StoredClaim>;
  responseLosses: Set<string>;
};

type RewardClaimGlobal = typeof globalThis & {
  __verzusM104RewardClaimStore?: RewardClaimStore;
};

const globalScope = globalThis as RewardClaimGlobal;

function createStore(): RewardClaimStore {
  return {
    version: 1,
    inventory: structuredClone(rewardInventoryMock),
    history: structuredClone(rewardsFoundationMock.history),
    auditEvents: [],
    claimsByIdempotencyKey: new Map(),
    responseLosses: new Set(),
  };
}

const store = globalScope.__verzusM104RewardClaimStore ?? createStore();
globalScope.__verzusM104RewardClaimStore = store;

export function getRewardClaimReadModel(): RewardClaimReadModel {
  return {
    version: store.version,
    inventory: structuredClone(store.inventory),
    history: structuredClone(store.history),
    auditEvents: structuredClone(store.auditEvents),
  };
}

export function getStoredRewardClaim(
  idempotencyKey: string,
  fingerprint: string,
): RewardClaimResult | null {
  const stored = store.claimsByIdempotencyKey.get(idempotencyKey);
  if (!stored) return null;
  if (stored.fingerprint !== fingerprint) {
    throw new Error("IDEMPOTENCY_KEY_REUSED");
  }
  return { ...structuredClone(stored.result), replayed: true };
}

export function persistRewardClaim(input: {
  playerId: string;
  rewardId: string;
  idempotencyKey: string;
  fingerprint: string;
  now: Date;
  requestId: string;
}): RewardClaimResult {
  const reward = store.inventory.find((item) => item.id === input.rewardId);
  if (!reward) throw new Error("REWARD_NOT_FOUND");

  const claimId = randomUUID();
  const claimReference = `CLM-${input.now.getUTCFullYear()}-${claimId.slice(0, 8).toUpperCase()}`;
  const claimedAt = input.now.toISOString();

  reward.state = "claimed";
  reward.availabilityLabel = "Added to inventory";
  reward.stateDetail = "The server confirmed this reward and rejected duplicate grants.";
  reward.claimReference = claimReference;
  reward.claimedAtLabel = "Claimed just now";

  const historyItem: RewardHistoryItem = {
    id: `history-${claimId}`,
    title: reward.title,
    description: reward.description,
    sourceLabel: reward.sourceLabel,
    claimedAtLabel: "Just now",
    kind: reward.kind,
    state: "claimed",
    amountLabel: reward.amountLabel,
    artworkSrc: reward.artworkSrc,
    artworkAlt: reward.artworkAlt,
  };

  const auditEvent: RewardClaimAuditEvent = {
    id: randomUUID(),
    playerId: input.playerId,
    rewardId: input.rewardId,
    action: "reward_claimed",
    claimReference,
    idempotencyKeyHash: createHash("sha256")
      .update(input.idempotencyKey)
      .digest("hex")
      .slice(0, 16),
    createdAt: claimedAt,
  };

  store.version += 1;
  store.history = [historyItem, ...store.history].slice(0, 50);
  store.auditEvents = [auditEvent, ...store.auditEvents].slice(0, 100);

  const result: RewardClaimResult = {
    claimId,
    claimReference,
    rewardId: input.rewardId,
    inventoryVersion: store.version,
    claimedAt,
    replayed: false,
    reward: structuredClone(reward),
    historyItem: structuredClone(historyItem),
    auditEvent: structuredClone(auditEvent),
    requestId: input.requestId,
  };

  store.claimsByIdempotencyKey.set(input.idempotencyKey, {
    fingerprint: input.fingerprint,
    result: structuredClone(result),
  });

  return result;
}

export function shouldLoseRewardClaimResponse(idempotencyKey: string): boolean {
  if (store.responseLosses.has(idempotencyKey)) return false;
  store.responseLosses.add(idempotencyKey);
  return true;
}

export function resetRewardClaimStore(): void {
  const fresh = createStore();
  store.version = fresh.version;
  store.inventory = fresh.inventory;
  store.history = fresh.history;
  store.auditEvents = fresh.auditEvents;
  store.claimsByIdempotencyKey.clear();
  store.responseLosses.clear();
}
