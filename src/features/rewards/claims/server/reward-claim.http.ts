// VERZUS M10.4 REWARD CLAIM HTTP HANDLER

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { rewardClaimCommandRawSchema } from "../schema/reward-claim.schema";
import type { RewardClaimResult, RewardClaimScenario } from "../model/reward-claim.types";
import { claimReward, RewardClaimServiceError } from "./reward-claim.service";
import { shouldLoseRewardClaimResponse } from "./reward-claim.store";

function serializeReward(item: RewardClaimResult["reward"]) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    state: item.state,
    amount_label: item.amountLabel,
    artwork_src: item.artworkSrc,
    artwork_alt: item.artworkAlt,
    source_label: item.sourceLabel,
    requirement_label: item.requirementLabel,
    availability_label: item.availabilityLabel,
    state_detail: item.stateDetail,
    ...(item.claimReference ? { claim_reference: item.claimReference } : {}),
    ...(item.claimedAtLabel ? { claimed_at_label: item.claimedAtLabel } : {}),
    ...(item.expiresAtLabel ? { expires_at_label: item.expiresAtLabel } : {}),
    ...(item.revokedReason ? { revoked_reason: item.revokedReason } : {}),
  };
}

function serializeHistory(item: RewardClaimResult["historyItem"]) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    state: item.state,
    amount_label: item.amountLabel,
    artwork_src: item.artworkSrc,
    artwork_alt: item.artworkAlt,
    source_label: item.sourceLabel,
    claimed_at_label: item.claimedAtLabel,
  };
}

function parseScenario(value: string | null): RewardClaimScenario {
  switch (value) {
    case "slow":
    case "error":
    case "conflict":
    case "response-lost":
    case "unavailable":
      return value;
    default:
      return "normal";
  }
}

function errorResponse(
  requestId: string,
  input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  },
) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
        ...(input.fieldErrors ? { field_errors: input.fieldErrors } : {}),
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    },
  );
}

export async function handleRewardClaim(
  request: NextRequest,
  context: { params: Promise<{ rewardId: string }> },
) {
  const requestId = randomUUID();
  const { rewardId } = await context.params;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";

  if (idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    return errorResponse(requestId, {
      code: "REWARD_IDEMPOTENCY_KEY_REQUIRED",
      message: "A valid Idempotency-Key header is required.",
      status: 400,
      retryable: false,
      fieldErrors: { idempotencyKey: ["Use an 8 to 200 character idempotency key."] },
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(requestId, {
      code: "REWARD_CLAIM_INVALID_JSON",
      message: "The claim command body is not valid JSON.",
      status: 400,
      retryable: false,
    });
  }

  const parsed = rewardClaimCommandRawSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(requestId, {
      code: "REWARD_CLAIM_VALIDATION_FAILED",
      message: "The claim command failed validation.",
      status: 400,
      retryable: false,
      fieldErrors: {
        expectedVersion: parsed.error.issues.map((issue) => issue.message),
      },
    });
  }

  const scenario = parseScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
  }
  if (scenario === "error") {
    return errorResponse(requestId, {
      code: "REWARD_CLAIM_TEMPORARY_FAILURE",
      message: "The reward ledger rejected this request temporarily.",
      status: 500,
      retryable: true,
    });
  }
  if (scenario === "unavailable") {
    return errorResponse(requestId, {
      code: "REWARD_CLAIM_SERVICE_UNAVAILABLE",
      message: "Reward claiming is temporarily unavailable.",
      status: 503,
      retryable: true,
    });
  }
  if (scenario === "conflict") {
    return errorResponse(requestId, {
      code: "REWARD_INVENTORY_STALE_VERSION",
      message: "Reward inventory changed. Refresh before starting a new claim.",
      status: 409,
      retryable: true,
    });
  }

  try {
    const result = claimReward({
      playerId: "player-prismo",
      rewardId,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      requestId,
    });

    if (
      scenario === "response-lost" &&
      !result.replayed &&
      shouldLoseRewardClaimResponse(idempotencyKey)
    ) {
      return errorResponse(requestId, {
        code: "REWARD_CLAIM_RESPONSE_LOST",
        message: "The claim may have completed, but confirmation was interrupted. Retry safely.",
        status: 504,
        retryable: true,
      });
    }

    return NextResponse.json(
      {
        data: {
          claim_id: result.claimId,
          claim_reference: result.claimReference,
          reward_id: result.rewardId,
          inventory_version: result.inventoryVersion,
          claimed_at: result.claimedAt,
          replayed: result.replayed,
          reward: serializeReward(result.reward),
          history_item: serializeHistory(result.historyItem),
          audit_event: {
            id: result.auditEvent.id,
            player_id: result.auditEvent.playerId,
            reward_id: result.auditEvent.rewardId,
            action: result.auditEvent.action,
            claim_reference: result.auditEvent.claimReference,
            idempotency_key_hash: result.auditEvent.idempotencyKeyHash,
            created_at: result.auditEvent.createdAt,
          },
        },
        meta: {
          request_id: requestId,
          processed_at: new Date().toISOString(),
          source: "mock-reward-claim",
        },
      },
      {
        status: result.replayed ? 200 : 201,
        headers: { "cache-control": "no-store", "x-request-id": requestId },
      },
    );
  } catch (error) {
    if (error instanceof RewardClaimServiceError) {
      return errorResponse(requestId, {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.retryable,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }

    return errorResponse(requestId, {
      code: "REWARD_CLAIM_UNEXPECTED_FAILURE",
      message: "The reward claim could not be completed.",
      status: 500,
      retryable: true,
    });
  }
}
