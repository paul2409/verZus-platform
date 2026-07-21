// VERZUS M12.2 ABORTABLE SEARCH CLIENT

import type { SearchEntityDomain } from "../../foundation";
import {
  adaptSearchResourceError,
  adaptSearchResourcePayload,
  SearchResourceError,
} from "../adapter/search-resource.adapter";
import type { SearchResourceScenario, SearchResourceSnapshot } from "../model/search-resource.types";

export async function getSearchResource(input: {
  domain: SearchEntityDomain;
  query: string;
  limit: number;
  scenario: SearchResourceScenario;
  signal?: AbortSignal;
}): Promise<SearchResourceSnapshot> {
  const params = new URLSearchParams({ q: input.query, limit: String(input.limit) });
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  let response: Response;
  try {
    response = await fetch(`/api/search/${input.domain}?${params.toString()}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new SearchResourceError({
      code: "SEARCH_RESOURCE_OFFLINE",
      message: `${input.domain} search is unavailable while offline.`,
      requestId: `search-${input.domain}-offline`,
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new SearchResourceError({
      code: "SEARCH_RESOURCE_INVALID_JSON",
      message: `${input.domain} search returned unreadable data.`,
      requestId: response.headers.get("x-request-id") ?? `search-${input.domain}-invalid-json`,
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptSearchResourceError(payload, response.status);
  return adaptSearchResourcePayload(payload);
}
