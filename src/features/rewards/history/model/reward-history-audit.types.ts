// VERZUS M10.6 AUDITABLE REWARD HISTORY DOMAIN TYPES

export const rewardAuditActions = [
  "reward_issued",
  "reward_claimed",
  "reward_expired",
  "reward_revoked",
] as const;
export type RewardAuditAction = (typeof rewardAuditActions)[number];

export type RewardHistoryAuditItem = {
  id: string;
  rewardId: string;
  title: string;
  kind: "coins" | "xp" | "crate" | "cosmetic" | "boost";
  action: RewardAuditAction;
  statusLabel: string;
  amountLabel: string;
  sourceLabel: string;
  occurredAt: string;
  occurredAtLabel: string;
  actorLabel: string;
  eventReference: string;
  claimReference: string | null;
  reason: string | null;
  inventoryVersion: number | null;
};

export type RewardHistoryAuditPage = {
  items: RewardHistoryAuditItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type RewardHistoryAuditSnapshot = {
  data: RewardHistoryAuditPage;
  meta: {
    requestId: string;
    fetchedAt: string;
  };
};
