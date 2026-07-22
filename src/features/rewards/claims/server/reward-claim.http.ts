import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";

import { rewardClaimCommandRawSchema } from "../schema/reward-claim.schema";
import { claimReward, RewardClaimServiceError } from "./reward-claim.service";

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
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return errorResponse(requestId, {
      code: "REWARD_CLAIM_UNAUTHORIZED",
      message: "Authentication is required to claim a reward.",
      status: 401,
      retryable: false,
    });
  }

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
      fieldErrors: { expectedVersion: parsed.error.issues.map((issue) => issue.message) },
    });
  }

  try {
    const data = await claimReward({
      userId: session.user.id,
      rewardId,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      requestId,
    });
    return NextResponse.json(
      {
        data,
        meta: {
          request_id: requestId,
          processed_at: new Date().toISOString(),
          source: "production-reward-claim",
        },
      },
      {
        status: data.replayed ? 200 : 201,
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
