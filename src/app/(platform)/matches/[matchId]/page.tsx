// VERZUS M7.1 MATCH OPERATIONS ROUTE
// VERZUS M7.2 SERVER CLOCK ROUTE INTEGRATION
// VERZUS M7.3 INDEPENDENT RESOURCE ROUTE INTEGRATION
// VERZUS M7.4 REFRESH-PERSISTENT CHECK-IN ROUTE INTEGRATION
// VERZUS M7.5 REFRESH-PERSISTENT LOBBY ROUTE INTEGRATION
// VERZUS M7.6 REFRESH-PERSISTENT RESULT ROUTE INTEGRATION
// VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE-STATE ROUTE INTEGRATION

import type { Metadata } from "next";

import {
  getMatchOperationsMock,
  matchAccessStates,
  matchAvailabilityStates,
  matchOperationReadScenarios,
  matchOperationResourceNames,
  matchTerminalRoles,
  MatchAccessStateScreen,
  MatchAvailabilityStateScreen,
  MatchOperationsResourceScreen,
  parseMatchOperationState,
  type MatchAccessState,
  type MatchAvailabilityState,
  type MatchOperationReadScenario,
  type MatchOperationResourceName,
  type MatchTerminalRole,
} from "@/features/matches";
import {
  getMatchLobbyOperationsSnapshot,
  getMatchResultOperationsSnapshot,
  getMatchTerminalSnapshot,
} from "@/features/matches/operations/server";

export const metadata: Metadata = {
  title: "Match Operations — VERZUS",
  description: "Check in, enter the lobby, submit results and track authoritative match state.",
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseScenario(value: string | string[] | undefined): MatchOperationReadScenario {
  const candidate = first(value);
  return matchOperationReadScenarios.includes(candidate as MatchOperationReadScenario)
    ? (candidate as MatchOperationReadScenario)
    : "normal";
}

function parseFailureResource(
  value: string | string[] | undefined,
): MatchOperationResourceName | null {
  const candidate = first(value);
  return matchOperationResourceNames.includes(candidate as MatchOperationResourceName)
    ? (candidate as MatchOperationResourceName)
    : null;
}

function parseAccess(value: string | string[] | undefined): MatchAccessState {
  const candidate = first(value);
  return matchAccessStates.includes(candidate as MatchAccessState)
    ? (candidate as MatchAccessState)
    : "authorized";
}

function parseAvailability(value: string | string[] | undefined): MatchAvailabilityState {
  const candidate = first(value);
  return matchAvailabilityStates.includes(candidate as MatchAvailabilityState)
    ? (candidate as MatchAvailabilityState)
    : "normal";
}

function parseRole(value: string | string[] | undefined): MatchTerminalRole {
  const candidate = first(value);
  return matchTerminalRoles.includes(candidate as MatchTerminalRole)
    ? (candidate as MatchTerminalRole)
    : "current_user";
}

export default async function MatchOperationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{
    state?: string | string[];
    scenario?: string | string[];
    resource?: string | string[];
    crash?: string | string[];
    access?: string | string[];
    availability?: string | string[];
    role?: string | string[];
  }>;
}) {
  const [{ matchId }, query] = await Promise.all([params, searchParams]);
  const access = parseAccess(query.access);
  if (access !== "authorized") return <MatchAccessStateScreen state={access} />;

  const requestedState = parseMatchOperationState(query.state);
  const resultSnapshot = getMatchResultOperationsSnapshot(matchId, requestedState);
  const terminalSnapshot = getMatchTerminalSnapshot(matchId, resultSnapshot.state);
  const lobbySnapshot = getMatchLobbyOperationsSnapshot(matchId, terminalSnapshot.state);
  const initialMatch = getMatchOperationsMock(
    matchId,
    terminalSnapshot.state,
    terminalSnapshot.clock,
  );
  initialMatch.matchVersion = terminalSnapshot.matchVersion;
  initialMatch.score = resultSnapshot.submission?.score ?? initialMatch.score;
  initialMatch.home = {
    ...initialMatch.home,
    checkedIn: lobbySnapshot.currentUser.checkedIn,
    ready: lobbySnapshot.currentUser.ready,
  };
  initialMatch.away = {
    ...initialMatch.away,
    checkedIn: lobbySnapshot.opponent.checkedIn,
    ready: lobbySnapshot.opponent.ready,
  };

  const availability = parseAvailability(query.availability);
  if (availability !== "normal") {
    return <MatchAvailabilityStateScreen availability={availability} initialMatch={initialMatch} />;
  }

  return (
    <MatchOperationsResourceScreen
      crashWidget={parseFailureResource(query.crash)}
      failureResource={parseFailureResource(query.resource)}
      initialMatch={initialMatch}
      resourceState={requestedState}
      scenario={parseScenario(query.scenario)}
      viewerRole={parseRole(query.role)}
    />
  );
}
