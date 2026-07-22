import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";

import type { RewardResourceName } from "../model/reward-resource.types";
import { serializeRewardResource } from "./reward-resource.service";

function errorResponse(
  requestId: string,
  input: { code: string; message: string; retryable: boolean; status: number },
) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    },
  );
}

export async function handleRewardResourceGet(
  _request: NextRequest,
  resource: RewardResourceName,
): Promise<NextResponse> {
  const requestId = `reward-${resource}-${crypto.randomUUID()}`;
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    return errorResponse(requestId, {
      code: "REWARD_RESOURCE_UNAUTHORIZED",
      message: "Authentication is required to access rewards.",
      retryable: false,
      status: 401,
    });
  }

  try {
    const data = await serializeRewardResource(session.user.id, resource);
    return NextResponse.json(
      {
        data,
        meta: {
          request_id: requestId,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          source: "production-reward-resource",
        },
      },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch {
    return errorResponse(requestId, {
      code: "REWARD_RESOURCE_UNAVAILABLE",
      message: `${resource} is temporarily unavailable.`,
      retryable: true,
      status: 503,
    });
  }
}
