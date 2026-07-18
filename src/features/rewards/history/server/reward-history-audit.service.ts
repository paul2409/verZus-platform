// VERZUS M10.6 AUDITABLE REWARD HISTORY SERVICE

import { getRewardClaimReadModel } from "../../claims/server/reward-claim.store";
import { rewardInventoryMock } from "../../inventory";
import type { RewardHistoryAuditItem } from "../model/reward-history-audit.types";

const fixedAuditItems: RewardHistoryAuditItem[] = [
  {
    id: "audit-expired-weekend-boost",
    rewardId: "inventory-weekend-xp-boost",
    title: "Weekend XP Boost",
    kind: "boost",
    action: "reward_expired",
    statusLabel: "Expired",
    amountLabel: "2x XP boost",
    sourceLabel: "Weekend Series",
    occurredAt: "2026-07-14T22:59:59.000Z",
    occurredAtLabel: "14 Jul 2026 · 23:59 WAT",
    actorLabel: "VERZUS Rewards Service",
    eventReference: "RWD-EVT-EXP-0714",
    claimReference: null,
    reason: "The reward passed its server-authoritative expiry deadline.",
    inventoryVersion: 1,
  },
  {
    id: "audit-revoked-beta-crate",
    rewardId: "inventory-fair-play-sticker",
    title: "Fair Play Sticker",
    kind: "crate",
    action: "reward_revoked",
    statusLabel: "Revoked",
    amountLabel: "Profile sticker",
    sourceLabel: "Fair Play Review",
    occurredAt: "2026-07-12T10:00:00.000Z",
    occurredAtLabel: "12 Jul 2026 · 11:00 WAT",
    actorLabel: "VERZUS Operations",
    eventReference: "RWD-EVT-REV-0712",
    claimReference: null,
    reason: "Eligibility changed after an auditable result correction.",
    inventoryVersion: 1,
  },
];

function claimAuditItems(): RewardHistoryAuditItem[] {
  const readModel = getRewardClaimReadModel();
  return readModel.auditEvents.map((event, index) => {
    const reward = readModel.inventory.find((item) => item.id === event.rewardId);
    return {
      id: event.id,
      rewardId: event.rewardId,
      title: reward?.title ?? "Reward claim",
      kind: reward?.kind ?? "coins",
      action: "reward_claimed",
      statusLabel: "Claimed",
      amountLabel: reward?.amountLabel ?? "Confirmed reward",
      sourceLabel: reward?.sourceLabel ?? "VERZUS reward inventory",
      occurredAt: event.createdAt,
      occurredAtLabel: index === 0 ? "Just now" : "Recently",
      actorLabel: "Authenticated player",
      eventReference: `RWD-EVT-${event.id.slice(0, 8).toUpperCase()}`,
      claimReference: event.claimReference,
      reason: null,
      inventoryVersion: readModel.version,
    };
  });
}

function issuedAndHistoricalClaimItems(): RewardHistoryAuditItem[] {
  const readModel = getRewardClaimReadModel();
  return readModel.history.slice(0, 3).map((item, index) => {
    const reward = rewardInventoryMock.find((candidate) => candidate.title === item.title);
    const timestamps = [
      "2026-07-18T06:15:00.000Z",
      "2026-07-17T08:30:00.000Z",
      "2026-07-16T19:45:00.000Z",
    ];
    return {
      id: `audit-history-${item.id}`,
      rewardId: reward?.id ?? item.id,
      title: item.title,
      kind: item.kind,
      action: "reward_issued",
      statusLabel: "Issued",
      amountLabel: item.amountLabel,
      sourceLabel: item.sourceLabel,
      occurredAt: timestamps[index] ?? "2026-07-15T12:00:00.000Z",
      occurredAtLabel: item.claimedAtLabel,
      actorLabel: "VERZUS Rewards Service",
      eventReference: `RWD-EVT-ISS-${String(index + 1).padStart(4, "0")}`,
      claimReference: reward?.claimReference ?? null,
      reason: null,
      inventoryVersion: readModel.version,
    };
  });
}

export function getRewardHistoryAuditPage(input: { page: number; pageSize: number }) {
  const items = [...claimAuditItems(), ...issuedAndHistoricalClaimItems(), ...fixedAuditItems].sort(
    (left, right) => right.occurredAt.localeCompare(left.occurredAt),
  );
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const start = (page - 1) * input.pageSize;

  return {
    items: items.slice(start, start + input.pageSize),
    page,
    pageSize: input.pageSize,
    total,
    totalPages,
  };
}

export function serializeRewardHistoryAuditPage(input: { page: number; pageSize: number }) {
  const result = getRewardHistoryAuditPage(input);
  return {
    items: result.items.map((item) => ({
      id: item.id,
      reward_id: item.rewardId,
      title: item.title,
      kind: item.kind,
      action: item.action,
      status_label: item.statusLabel,
      amount_label: item.amountLabel,
      source_label: item.sourceLabel,
      occurred_at: item.occurredAt,
      occurred_at_label: item.occurredAtLabel,
      actor_label: item.actorLabel,
      event_reference: item.eventReference,
      claim_reference: item.claimReference,
      reason: item.reason,
      inventory_version: item.inventoryVersion,
    })),
    page: result.page,
    page_size: result.pageSize,
    total: result.total,
    total_pages: result.totalPages,
  };
}
