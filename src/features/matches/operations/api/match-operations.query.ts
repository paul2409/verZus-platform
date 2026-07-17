// VERZUS M7.3 MATCH OPERATIONS QUERY RESOURCES

import { queryOptions } from "@tanstack/react-query";

import type {
  MatchOperationReadScenario,
  MatchOperationResourceName,
} from "../model/match-resource.types";
import type { MatchOperationState } from "../model/match-operations.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import {
  getMatchCheckIn,
  getMatchClock,
  getMatchDispute,
  getMatchEvidence,
  getMatchLobby,
  getMatchParticipants,
  getMatchResult,
  getMatchSummary,
  getMatchSupport,
  getMatchTimeline,
  type MatchOperationsReadRequest,
} from "./match-operations-api.client";

export const matchOperationsQueryKeys = {
  all: ["matches", "operations"] as const,
  resource: (
    matchId: string,
    resource: MatchOperationResourceName,
    state: MatchOperationState,
    scenario: MatchOperationReadScenario,
  ) => ["matches", "operations", matchId, resource, state, scenario] as const,
};

function request(
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
  signal: AbortSignal,
): MatchOperationsReadRequest {
  return scenario === "normal" ? { state, signal } : { state, scenario, signal };
}

function retry(failureCount: number, error: Error) {
  if (failureCount >= 2) return false;
  return error instanceof MatchOperationsApiClientError ? error.retryable : true;
}

function resourceOptions<TData>(
  id: string,
  resource: MatchOperationResourceName,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
  load: (id: string, request: MatchOperationsReadRequest) => Promise<TData>,
  staleTime: number,
) {
  return queryOptions({
    queryKey: matchOperationsQueryKeys.resource(id, resource, state, scenario),
    queryFn: ({ signal }) => load(id, request(state, scenario, signal)),
    staleTime,
    gcTime: 15 * 60_000,
    retry,
  });
}

export const matchSummaryQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "summary", state, scenario, getMatchSummary, 30_000);
export const matchParticipantsQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "participants", state, scenario, getMatchParticipants, 15_000);
export const matchTimelineQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "timeline", state, scenario, getMatchTimeline, 5_000);
export const matchClockQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "clock", state, scenario, getMatchClock, 5_000);
export const matchCheckInQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "check-in", state, scenario, getMatchCheckIn, 5_000);
export const matchLobbyQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "lobby", state, scenario, getMatchLobby, 5_000);
export const matchResultQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "result", state, scenario, getMatchResult, 10_000);
export const matchEvidenceQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "evidence", state, scenario, getMatchEvidence, 15_000);
export const matchDisputeQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "dispute", state, scenario, getMatchDispute, 10_000);
export const matchSupportQueryOptions = (
  id: string,
  state: MatchOperationState,
  scenario: MatchOperationReadScenario,
) => resourceOptions(id, "support", state, scenario, getMatchSupport, 60_000);
