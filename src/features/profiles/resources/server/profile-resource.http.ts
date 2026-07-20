// VERZUS M11.4 PROFILE RESOURCE HTTP HANDLER

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ProfileResourceName, ProfileResourceScenario } from "../model/profile-resource.types";
import {
  normalizeProfileResourceScenario,
  serializeProfileResource,
} from "./profile-resource.service";

function requestId(resource: ProfileResourceName): string {
  return `profile-${resource}-${crypto.randomUUID()}`;
}

function failureFor(
  scenario: ProfileResourceScenario,
  resource: ProfileResourceName,
): { code: string; message: string; retryable: boolean; status: number } | null {
  switch (scenario) {
    case "offline":
      return {
        code: "PROFILE_RESOURCE_OFFLINE",
        message: `${resource} is unavailable while offline.`,
        retryable: true,
        status: 503,
      };
    case "error":
      return {
        code: "PROFILE_RESOURCE_UNAVAILABLE",
        message: `${resource} is temporarily unavailable.`,
        retryable: true,
        status: 503,
      };
    case "unauthorized":
      return {
        code: "PROFILE_RESOURCE_UNAUTHORIZED",
        message: `Authentication is required to access ${resource}.`,
        retryable: false,
        status: 401,
      };
    case "forbidden":
      return {
        code: "PROFILE_RESOURCE_FORBIDDEN",
        message: `This account cannot access ${resource}.`,
        retryable: false,
        status: 403,
      };
    case "not-found":
      return {
        code: "PROFILE_RESOURCE_NOT_FOUND",
        message: `${resource} could not be found.`,
        retryable: false,
        status: 404,
      };
    case "maintenance":
      return {
        code: "PROFILE_RESOURCE_MAINTENANCE",
        message: `${resource} is temporarily under maintenance.`,
        retryable: true,
        status: 503,
      };
    default:
      return null;
  }
}

export async function handleProfileResourceGet(
  request: NextRequest,
  resource: ProfileResourceName,
): Promise<NextResponse> {
  const scenario = normalizeProfileResourceScenario(request.nextUrl.searchParams.get("scenario"));
  const id = requestId(resource);

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));

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
      ? { invalid_profile_resource: resource, payload: false }
      : serializeProfileResource(resource, scenario);

  return NextResponse.json(
    {
      data,
      meta: {
        request_id: id,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        source: "mock-profile-resource",
        version: 1,
      },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
