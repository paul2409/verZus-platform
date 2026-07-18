// VERZUS M10.3 REWARD RESOURCE HTTP HANDLER
// VERZUS M10.7 CONTROLLED AUTHORIZATION, NOT-FOUND AND MAINTENANCE RESPONSES

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { RewardResourceName, RewardResourceScenario } from "../model/reward-resource.types";
import {
  normalizeRewardResourceScenario,
  serializeRewardResource,
} from "./reward-resource.service";

function requestId(resource: RewardResourceName): string {
  return `reward-${resource}-${crypto.randomUUID()}`;
}

function failureFor(
  scenario: RewardResourceScenario,
  resource: RewardResourceName,
): { code: string; message: string; retryable: boolean; status: number } | null {
  switch (scenario) {
    case "offline":
      return {
        code: "REWARD_RESOURCE_OFFLINE",
        message: `${resource} is unavailable while offline.`,
        retryable: true,
        status: 503,
      };
    case "error":
      return {
        code: "REWARD_RESOURCE_UNAVAILABLE",
        message: `${resource} is temporarily unavailable.`,
        retryable: true,
        status: 503,
      };
    case "unauthorized":
      return {
        code: "REWARD_RESOURCE_UNAUTHORIZED",
        message: `Authentication is required to access ${resource}.`,
        retryable: false,
        status: 401,
      };
    case "forbidden":
      return {
        code: "REWARD_RESOURCE_FORBIDDEN",
        message: `This account cannot access ${resource}.`,
        retryable: false,
        status: 403,
      };
    case "not-found":
      return {
        code: "REWARD_RESOURCE_NOT_FOUND",
        message: `${resource} could not be found.`,
        retryable: false,
        status: 404,
      };
    case "maintenance":
      return {
        code: "REWARD_RESOURCE_MAINTENANCE",
        message: `${resource} is temporarily under maintenance.`,
        retryable: true,
        status: 503,
      };
    default:
      return null;
  }
}

export async function handleRewardResourceGet(
  request: NextRequest,
  resource: RewardResourceName,
): Promise<NextResponse> {
  const scenario = normalizeRewardResourceScenario(request.nextUrl.searchParams.get("scenario"));
  const id = requestId(resource);

  if (scenario === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
  }

  const failure = failureFor(scenario, resource);
  if (failure) {
    return NextResponse.json(
      {
        error: {
          code: failure.code,
          message: failure.message,
          request_id: id,
          retryable: failure.retryable,
        },
      },
      {
        status: failure.status,
        headers: {
          "cache-control": "no-store",
          "x-request-id": id,
          ...(scenario === "maintenance" ? { "retry-after": "60" } : {}),
        },
      },
    );
  }

  const data =
    scenario === "malformed"
      ? { malformed_resource: resource, invalid_payload: true }
      : serializeRewardResource(resource, scenario);

  return NextResponse.json(
    {
      data,
      meta: {
        request_id: id,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        source: "mock-reward-resource",
      },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
