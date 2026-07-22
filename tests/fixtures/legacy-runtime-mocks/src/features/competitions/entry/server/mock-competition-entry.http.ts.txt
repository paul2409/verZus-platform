import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "@/shared/session/mock-session";

import { competitionDetailScenarioSchema } from "../../details/model/competition-detail.schema";
import { handleMockCompetitionDiscoveryGet } from "../../discovery/server/mock-competition-discovery.http";
import {
  readStoredCompetitionEntries,
  writeStoredCompetitionEntries,
} from "./mock-competition-entry.cookie";
import {
  decideMockCompetitionEntry,
  getMockCompetitionEntryControl,
  latestCompetitionEntryForDiscovery,
} from "./mock-competition-entry.service";

function accessFailure(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        request_id: `mock-competition-entry-access-${globalThis.crypto.randomUUID()}`,
        retryable: false,
        field_errors: {},
      },
    },
    { status },
  );
}

function access(request: NextRequest) {
  if (!isMockSessionEnabled()) {
    return accessFailure(503, "service_unavailable", "Mock competition APIs are disabled.");
  }
  const state = authStateFromMockSession(request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null);
  if (state === "authenticated") return null;
  if (state === "anonymous") {
    return accessFailure(401, "unauthorized", "Sign in before entering a competition.");
  }
  return accessFailure(403, "forbidden", "Complete onboarding before using Compete.");
}

function scenario(request: NextRequest) {
  const parsed = competitionDetailScenarioSchema.safeParse(
    request.nextUrl.searchParams.get("scenario"),
  );
  return parsed.success ? parsed.data : "normal";
}

function response(decision: {
  status: number;
  body: unknown;
  entriesToPersist: ReturnType<typeof readStoredCompetitionEntries> | null;
}) {
  const result = NextResponse.json(decision.body, {
    status: decision.status,
    headers: {
      "cache-control": "no-store",
      "x-verzus-resource": "competition-entry",
    },
  });

  if (decision.entriesToPersist) {
    writeStoredCompetitionEntries(result, decision.entriesToPersist);
  }

  const body = decision.body as {
    ok?: boolean;
    request_id?: string;
    error?: { request_id?: string; code?: string };
  };
  const requestId = body.request_id ?? body.error?.request_id;
  if (requestId) result.headers.set("x-request-id", requestId);
  return result;
}

export function handleMockCompetitionEntryGet(request: NextRequest, competitionId: string) {
  const denied = access(request);
  if (denied) return denied;
  return response(
    getMockCompetitionEntryControl({
      competitionId,
      scenario: scenario(request),
      storedEntries: readStoredCompetitionEntries(request),
    }),
  );
}

export async function handleMockCompetitionEntryPost(request: NextRequest, competitionId: string) {
  const denied = access(request);
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const decision = decideMockCompetitionEntry({
    competitionId,
    scenario: scenario(request),
    storedEntries: readStoredCompetitionEntries(request),
    payload,
    idempotencyHeader: request.headers.get("idempotency-key"),
  });

  console.warn(
    JSON.stringify({
      event: "competition.entry.completed",
      competitionId,
      status: decision.status,
      success: (decision.body as { ok?: boolean }).ok === true,
      release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    }),
  );

  return response(decision);
}

export function handlePersistentCompetitionEntryDiscoveryGet(request: NextRequest) {
  if (scenario(request) !== "normal") {
    return handleMockCompetitionDiscoveryGet(request, "current-entry");
  }

  const denied = access(request);
  if (denied) return denied;

  const entry = latestCompetitionEntryForDiscovery(readStoredCompetitionEntries(request));
  const now = new Date().toISOString();
  const requestId = `mock-competition-current-entry-${globalThis.crypto.randomUUID()}`;
  const result = NextResponse.json(
    {
      ok: true,
      data: {
        entry_id: entry.entryId,
        competition_name: entry.competitionName,
        state_label: "CONFIRMED",
        team_label: entry.teamLabel,
        status_label: "STATUS: REGISTERED",
      },
      request_id: requestId,
      meta: {
        server_now: now,
        last_updated_at: entry.registeredAt,
        freshness: "fresh",
      },
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
        "x-verzus-resource": "competition-current-entry",
        "x-request-id": requestId,
      },
    },
  );
  return result;
}
