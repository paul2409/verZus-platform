// VERZUS M10.6 AUDITABLE REWARD HISTORY ADAPTER

import type { RewardHistoryAuditSnapshot } from "../model/reward-history-audit.types";
import {
  rewardHistoryAuditEnvelopeSchema,
  rewardHistoryAuditErrorSchema,
} from "../schema/reward-history-audit.schema";

export class RewardHistoryAuditError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "RewardHistoryAuditError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

export function adaptRewardHistoryAuditPayload(payload: unknown): RewardHistoryAuditSnapshot {
  const parsed = rewardHistoryAuditEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    const failure = rewardHistoryAuditErrorSchema.safeParse(payload);
    if (failure.success) {
      throw new RewardHistoryAuditError({
        code: failure.data.error.code,
        message: failure.data.error.message,
        requestId: failure.data.error.request_id,
        retryable: failure.data.error.retryable,
      });
    }
    throw new RewardHistoryAuditError({
      code: "REWARD_HISTORY_AUDIT_SCHEMA_INVALID",
      message: "Reward history failed schema validation.",
      requestId: "reward-history-audit-schema-invalid",
      retryable: true,
    });
  }

  return {
    data: {
      items: parsed.data.data.items.map((item) => ({
        id: item.id,
        rewardId: item.reward_id,
        title: item.title,
        kind: item.kind,
        action: item.action,
        statusLabel: item.status_label,
        amountLabel: item.amount_label,
        sourceLabel: item.source_label,
        occurredAt: item.occurred_at,
        occurredAtLabel: item.occurred_at_label,
        actorLabel: item.actor_label,
        eventReference: item.event_reference,
        claimReference: item.claim_reference,
        reason: item.reason,
        inventoryVersion: item.inventory_version,
      })),
      page: parsed.data.data.page,
      pageSize: parsed.data.data.page_size,
      total: parsed.data.data.total,
      totalPages: parsed.data.data.total_pages,
    },
    meta: {
      requestId: parsed.data.meta.request_id,
      fetchedAt: parsed.data.meta.fetched_at,
    },
  };
}
