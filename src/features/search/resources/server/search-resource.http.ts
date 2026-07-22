import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server";
import type { SearchEntityDomain } from "../../foundation";
import { normalizeSearchQuery, searchDomainItems, serializeSearchItem } from "./search-resource.service";

function requestId(domain: SearchEntityDomain): string {
  return `search-${domain}-${crypto.randomUUID()}`;
}

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  requestId: string;
  retryable?: boolean;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable ?? false,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

export async function handleSearchResourceGet(
  request: NextRequest,
  domain: SearchEntityDomain,
): Promise<NextResponse> {
  const id = requestId(domain);
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return errorResponse({
      status: 401,
      code: "SEARCH_RESOURCE_UNAUTHORIZED",
      message: "Sign in again to search VERZUS.",
      requestId: id,
    });
  }

  const query = normalizeSearchQuery(request.nextUrl.searchParams.get("q"));
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(20, Math.max(1, Math.trunc(requestedLimit)))
    : 12;

  try {
    const items = await searchDomainItems({
      domain,
      query,
      limit,
      viewerUserId: session.user.id,
    });

    return NextResponse.json(
      {
        data: { items: items.map(serializeSearchItem) },
        meta: {
          request_id: id,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          source: "postgresql",
          domain,
          query,
          total: items.length,
        },
      },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch {
    return errorResponse({
      status: 503,
      code: "SEARCH_RESOURCE_UNAVAILABLE",
      message: `${domain} search is temporarily unavailable.`,
      requestId: id,
      retryable: true,
    });
  }
}
