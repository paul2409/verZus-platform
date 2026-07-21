// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.2 SEARCH RESOURCE HTTP HANDLER

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { SearchEntityDomain } from "../../foundation";
import {
  normalizeSearchQuery,
  normalizeSearchResourceScenario,
  searchDomainItems,
  serializeSearchItem,
} from "./search-resource.service";

function createRequestId(domain: SearchEntityDomain): string {
  return `search-${domain}-${crypto.randomUUID()}`;
}

export async function handleSearchResourceGet(
  request: NextRequest,
  domain: SearchEntityDomain,
): Promise<NextResponse> {
  const query = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));
  const scenario = normalizeSearchResourceScenario(request.nextUrl.searchParams.get("scenario"));
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(20, Math.max(1, Math.trunc(requestedLimit)))
    : 12;
  const requestId = createRequestId(domain);

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_000));

  const edgeFailures = {
    unauthorized: [401, "SEARCH_RESOURCE_UNAUTHORIZED", `Sign in again to search ${domain}.`, false],
    forbidden: [403, "SEARCH_RESOURCE_FORBIDDEN", `You do not have permission to search ${domain}.`, false],
    "not-found": [404, "SEARCH_RESOURCE_NOT_FOUND", `The ${domain} Search index was not found.`, false],
    maintenance: [503, "SEARCH_RESOURCE_MAINTENANCE", `The ${domain} Search index is undergoing maintenance.`, true],
  } as const;

  if (scenario in edgeFailures) {
    const [status, code, message, retryable] = edgeFailures[scenario as keyof typeof edgeFailures];
    return NextResponse.json(
      { error: { code, message, request_id: requestId, retryable } },
      { status, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  if (scenario === "offline" || scenario === "error") {
    const code = scenario === "offline" ? "SEARCH_RESOURCE_OFFLINE" : "SEARCH_RESOURCE_UNAVAILABLE";
    const message =
      scenario === "offline"
        ? `${domain} search is unavailable while offline.`
        : `${domain} search is temporarily unavailable.`;
    return NextResponse.json(
      { error: { code, message, request_id: requestId, retryable: true } },
      { status: 503, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { invalid_domain: domain }, meta: { request_id: requestId } },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const items = searchDomainItems(domain, query, limit, scenario);
  return NextResponse.json(
    {
      data: { items: items.map(serializeSearchItem) },
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        source: "mock-search-index",
        domain,
        query,
        total: items.length,
      },
    },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
