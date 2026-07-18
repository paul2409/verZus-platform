// VERZUS M10.4 REWARD CLAIM CLIENT

import type {
  RewardClaimAttempt,
  RewardClaimErrorShape,
  RewardClaimResult,
} from "../model/reward-claim.types";
import {
  rewardClaimEnvelopeRawSchema,
  rewardClaimErrorEnvelopeRawSchema,
} from "../schema/reward-claim.schema";

export class RewardClaimClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: RewardClaimErrorShape) {
    super(input.message);
    this.name = "RewardClaimClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function adaptReward(raw: ReturnType<typeof rewardClaimEnvelopeRawSchema.parse>["data"]["reward"]) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    kind: raw.kind,
    state: raw.state,
    amountLabel: raw.amount_label,
    artworkSrc: raw.artwork_src,
    artworkAlt: raw.artwork_alt,
    sourceLabel: raw.source_label,
    requirementLabel: raw.requirement_label,
    availabilityLabel: raw.availability_label,
    stateDetail: raw.state_detail,
    ...(raw.claim_reference ? { claimReference: raw.claim_reference } : {}),
    ...(raw.claimed_at_label ? { claimedAtLabel: raw.claimed_at_label } : {}),
    ...(raw.expires_at_label ? { expiresAtLabel: raw.expires_at_label } : {}),
    ...(raw.revoked_reason ? { revokedReason: raw.revoked_reason } : {}),
  };
}

export async function postRewardClaim(attempt: RewardClaimAttempt): Promise<RewardClaimResult> {
  const query =
    attempt.scenario === "normal" ? "" : `?scenario=${encodeURIComponent(attempt.scenario)}`;

  let response: Response;
  try {
    response = await fetch(`/api/rewards/${encodeURIComponent(attempt.rewardId)}/claim${query}`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key": attempt.idempotencyKey,
      },
      body: JSON.stringify({ expected_version: attempt.expectedVersion }),
    });
  } catch {
    throw new RewardClaimClientError({
      code: "REWARD_CLAIM_OFFLINE",
      message: "Reward claiming is unavailable while offline.",
      requestId: "reward-claim-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RewardClaimClientError({
      code: "REWARD_CLAIM_INVALID_JSON",
      message: "Reward claiming returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "reward-claim-invalid-json",
      retryable: response.status >= 500,
    });
  }

  if (!response.ok) {
    const parsedError = rewardClaimErrorEnvelopeRawSchema.safeParse(payload);
    if (parsedError.success) {
      throw new RewardClaimClientError({
        code: parsedError.data.error.code,
        message: parsedError.data.error.message,
        requestId: parsedError.data.error.request_id,
        retryable: parsedError.data.error.retryable,
        ...(parsedError.data.error.field_errors
          ? { fieldErrors: parsedError.data.error.field_errors }
          : {}),
      });
    }

    throw new RewardClaimClientError({
      code: "REWARD_CLAIM_REQUEST_FAILED",
      message: "Reward claiming failed.",
      requestId: response.headers.get("x-request-id") ?? "reward-claim-request-failed",
      retryable: response.status >= 500,
    });
  }

  const parsed = rewardClaimEnvelopeRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new RewardClaimClientError({
      code: "REWARD_CLAIM_SCHEMA_INVALID",
      message: "Reward claim confirmation failed validation.",
      requestId: response.headers.get("x-request-id") ?? "reward-claim-schema-invalid",
      retryable: false,
    });
  }

  const data = parsed.data.data;
  return {
    claimId: data.claim_id,
    claimReference: data.claim_reference,
    rewardId: data.reward_id,
    inventoryVersion: data.inventory_version,
    claimedAt: data.claimed_at,
    replayed: data.replayed,
    reward: adaptReward(data.reward),
    historyItem: {
      id: data.history_item.id,
      title: data.history_item.title,
      description: data.history_item.description,
      kind: data.history_item.kind,
      state: data.history_item.state,
      amountLabel: data.history_item.amount_label,
      artworkSrc: data.history_item.artwork_src,
      artworkAlt: data.history_item.artwork_alt,
      sourceLabel: data.history_item.source_label,
      claimedAtLabel: data.history_item.claimed_at_label,
    },
    auditEvent: {
      id: data.audit_event.id,
      playerId: data.audit_event.player_id,
      rewardId: data.audit_event.reward_id,
      action: data.audit_event.action,
      claimReference: data.audit_event.claim_reference,
      idempotencyKeyHash: data.audit_event.idempotency_key_hash,
      createdAt: data.audit_event.created_at,
    },
    requestId: parsed.data.meta.request_id,
  };
}
