import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/features/auth/server/auth.constants";
import { readAccountSession } from "@/features/auth/server/auth.service";

import type { CompetitionLifecycleDecision } from "../lifecycle/model/competition-lifecycle.types";
import {
  CompetitionServiceError,
  competitionResourceMeta,
  confirmCompetitionEntry,
  getCompetitionDetailResource,
  getCompetitionDiscoveryList,
  getCompetitionEntryControl,
  getCompetitionLifecycle,
  getCompetitionMetadata,
  getCurrentCompetitionEntry,
  getFeaturedCompetition,
  getRecommendedCompetitions,
} from "./competition.service";

export type CompetitionDiscoveryResource = "featured" | "list" | "metadata" | "current-entry";
export type CompetitionDetailResource =
  "summary" | "eligibility" | "schedule" | "rewards" | "rules" | "participants" | "bracket";

class CompetitionAccessError extends CompetitionServiceError {}

function requestId(): string {
  return `competition-${randomUUID()}`;
}

async function authenticatedUserId(request: NextRequest): Promise<string> {
  const rawToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value ?? null;
  const session = await readAccountSession(rawToken);

  if (session.state === "anonymous" || session.state === "session_expired") {
    throw new CompetitionAccessError(401, "unauthorized", "Sign in before using competitions.");
  }

  if (session.state !== "authenticated" || !session.user) {
    throw new CompetitionAccessError(
      403,
      "forbidden",
      "Complete account verification and onboarding before using competitions.",
    );
  }

  return session.user.id;
}

function failure(error: CompetitionServiceError, id: string) {
  const response = NextResponse.json(
    {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        request_id: id,
        retryable: error.retryable,
        field_errors: error.fieldErrors,
      },
    },
    { status: error.status },
  );
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-request-id", id);
  return response;
}

function unexpected(error: unknown, id: string) {
  console.error(
    JSON.stringify({
      event: "competition.request.failed",
      requestId: id,
      message: error instanceof Error ? error.message : "Unknown competition error",
    }),
  );
  return failure(
    new CompetitionServiceError(
      503,
      "service_unavailable",
      "Competition data is temporarily unavailable.",
      { retryable: true },
    ),
    id,
  );
}

async function execute(operation: (id: string) => Promise<NextResponse>) {
  const id = requestId();
  try {
    return await operation(id);
  } catch (error) {
    if (error instanceof CompetitionServiceError) return failure(error, id);
    return unexpected(error, id);
  }
}

function success(data: unknown, id: string, resource: string, status = 200) {
  const response = NextResponse.json(
    {
      ok: true,
      data,
      request_id: id,
      meta: competitionResourceMeta(),
    },
    { status },
  );
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-request-id", id);
  response.headers.set("x-verzus-resource", resource);
  return response;
}

export function handleCompetitionDiscoveryGet(
  request: NextRequest,
  resource: CompetitionDiscoveryResource,
) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    const data =
      resource === "featured"
        ? await getFeaturedCompetition(userId)
        : resource === "list"
          ? await getCompetitionDiscoveryList(userId, request.nextUrl.searchParams)
          : resource === "metadata"
            ? await getCompetitionMetadata()
            : await getCurrentCompetitionEntry(userId);
    return success(data, id, `competition-discovery-${resource}`);
  });
}

export function handleCompetitionDetailGet(
  request: NextRequest,
  competitionId: string,
  resource: CompetitionDetailResource,
) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    const data = await getCompetitionDetailResource(userId, competitionId, resource);
    return success(data, id, `competition-detail-${resource}`);
  });
}

export function handleCompetitionEntryGet(request: NextRequest, competitionId: string) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    const data = await getCompetitionEntryControl(userId, competitionId);
    return success(data, id, "competition-entry-control");
  });
}

export function handleCompetitionEntryPost(request: NextRequest, competitionId: string) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      payload = null;
    }
    const result = await confirmCompetitionEntry({
      userId,
      competitionId,
      payload,
      idempotencyHeader: request.headers.get("idempotency-key"),
      requestId: id,
    });
    return success(result.data, id, "competition-entry-mutation", result.status);
  });
}

function lifecycleRaw(decision: CompetitionLifecycleDecision) {
  return {
    competition_id: decision.competitionId,
    lifecycle: decision.lifecycle,
    scenario: "normal" as const,
    disposition: decision.disposition,
    title: decision.title,
    message: decision.message,
    severity: decision.severity,
    primary_action: decision.primaryAction,
    entry_allowed: decision.entryAllowed,
    waitlist_allowed: decision.waitlistAllowed,
    blocking: decision.blocking,
    retryable: decision.retryable,
    registered_count: decision.registeredCount,
    capacity: decision.capacity,
  };
}

export function handleCompetitionLifecycleGet(request: NextRequest, competitionId: string) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    const decision = await getCompetitionLifecycle(userId, competitionId);
    const now = new Date().toISOString();
    const response = NextResponse.json(
      {
        ok: true,
        data: lifecycleRaw(decision),
        meta: {
          request_id: id,
          server_now: now,
          last_updated_at: now,
          freshness: "fresh",
        },
      },
      { status: 200 },
    );
    response.headers.set("cache-control", "no-store");
    response.headers.set("x-request-id", id);
    response.headers.set("x-verzus-resource", "competition-lifecycle");
    return response;
  });
}

export function handleRecommendedCompetitionsGet(request: NextRequest) {
  return execute(async (id) => {
    const userId = await authenticatedUserId(request);
    const data = await getRecommendedCompetitions(userId);
    const response = NextResponse.json({ ok: true, data, request_id: id }, { status: 200 });
    response.headers.set("cache-control", "no-store");
    response.headers.set("x-request-id", id);
    response.headers.set("x-verzus-resource", "recommended-competitions");
    return response;
  });
}
