import { serializeCompetitionDiscoverySearchParams } from "../model/competition-discovery.query";
import type {
  CompetitionDiscoveryFilters,
  CompetitionDiscoveryScenario,
  CompetitionEntryResourceData,
  CompetitionListResourceData,
  CompetitionMetadataResourceData,
  FeaturedCompetitionResourceData,
} from "../model/competition-discovery.types";
import {
  adaptCompetitionDiscoveryListPayload,
  adaptCompetitionDiscoveryMetadataPayload,
  adaptCurrentCompetitionEntryPayload,
  adaptFeaturedCompetitionPayload,
  CompetitionDiscoveryApiClientError,
} from "./competition-discovery-api.adapter";

export type CompetitionDiscoveryReadRequest = {
  scenario?: CompetitionDiscoveryScenario;
  signal?: AbortSignal;
};

function appendScenario(params: URLSearchParams, scenario?: CompetitionDiscoveryScenario) {
  if (scenario && scenario !== "normal") params.set("scenario", scenario);
  return params;
}

async function readResource<TData>(
  path: string,
  params: URLSearchParams,
  adapt: (payload: unknown) => TData,
  signal?: AbortSignal,
): Promise<TData> {
  const url = params.size > 0 ? `${path}?${params.toString()}` : path;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CompetitionDiscoveryApiClientError({
      code: "offline",
      message: "Competition discovery is unavailable while offline.",
      requestId: "competition-client-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CompetitionDiscoveryApiClientError({
      code: "invalid_response",
      message: "Competition discovery returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "competition-client-invalid-json",
      retryable: true,
    });
  }

  return adapt(payload);
}

export function getFeaturedCompetition(
  request: CompetitionDiscoveryReadRequest = {},
): Promise<FeaturedCompetitionResourceData> {
  return readResource(
    "/api/competitions/discovery/featured",
    appendScenario(new URLSearchParams(), request.scenario),
    adaptFeaturedCompetitionPayload,
    request.signal,
  );
}

export function getCompetitionDiscoveryList(
  filters: CompetitionDiscoveryFilters,
  request: CompetitionDiscoveryReadRequest = {},
): Promise<CompetitionListResourceData> {
  return readResource(
    "/api/competitions/discovery",
    appendScenario(serializeCompetitionDiscoverySearchParams(filters), request.scenario),
    adaptCompetitionDiscoveryListPayload,
    request.signal,
  );
}

export function getCompetitionDiscoveryMetadata(
  request: CompetitionDiscoveryReadRequest = {},
): Promise<CompetitionMetadataResourceData> {
  return readResource(
    "/api/competitions/discovery/metadata",
    appendScenario(new URLSearchParams(), request.scenario),
    adaptCompetitionDiscoveryMetadataPayload,
    request.signal,
  );
}

export function getCurrentCompetitionEntry(
  request: CompetitionDiscoveryReadRequest = {},
): Promise<CompetitionEntryResourceData> {
  return readResource(
    "/api/competitions/entries/me",
    appendScenario(new URLSearchParams(), request.scenario),
    adaptCurrentCompetitionEntryPayload,
    request.signal,
  );
}
