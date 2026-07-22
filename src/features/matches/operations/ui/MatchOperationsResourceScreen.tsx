"use client";

// VERZUS M7.3 INDEPENDENT QUERY-BACKED MATCH OPERATIONS SCREEN
// VERZUS M7.4 IDEMPOTENT CHECK-IN AND READINESS
// VERZUS M7.5 LOBBY AND IN-PROGRESS OPERATIONS
// VERZUS M7.6 RESULTS, EVIDENCE, CONFIRMATION AND DISPUTES
// VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE ISOLATION
// VERZUS M7.8 TESTING, OBSERVABILITY AND RELEASE

import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";

import {
  matchCheckInQueryOptions,
  matchClockQueryOptions,
  matchDisputeQueryOptions,
  matchEvidenceQueryOptions,
  matchLobbyQueryOptions,
  matchParticipantsQueryOptions,
  matchResultQueryOptions,
  matchSummaryQueryOptions,
  matchSupportQueryOptions,
  matchTimelineQueryOptions,
} from "../api";
import type {
  MatchOperationReadScenario,
  MatchOperationResourceName,
  MatchResource,
  MatchResourceData,
} from "../model/match-resource.types";
import type { MatchTerminalRole } from "../model/match-terminal-operations.types";
import type { MatchOperationsViewModel } from "../model/match-operations.types";
import { getMatchWorkflowSections } from "../model/match-workflow";
import { CheckInMutationPanel } from "./CheckInMutationPanel";
import { DisputeOperationsPanel } from "./DisputeOperationsPanel";
import { EvidenceUploadPanel } from "./EvidenceUploadPanel";
import { LobbyOperationsPanel } from "./LobbyOperationsPanel";
import {
  MatchHeader,
  MatchSupportPanel,
  MatchTimeline,
  ParticipantPanel,
} from "./MatchOperationsPanels";
import styles from "./MatchOperationsScreen.module.css";
import { MatchWidgetBoundary, MatchWidgetCrashProbe } from "./MatchWidgetBoundary";
import { ResultOperationsPanel } from "./ResultOperationsPanel";
import { TerminalOperationsPanel } from "./TerminalOperationsPanel";
import { matchResourceFromQuery } from "./match-operations-resource";

export type MatchOperationsResourceScreenProps = {
  initialMatch: MatchOperationsViewModel;
  failureResource: MatchOperationResourceName | null;
  scenario: MatchOperationReadScenario;
  resourceState: MatchOperationsViewModel["state"];
  crashWidget: MatchOperationResourceName | null;
  viewerRole: MatchTerminalRole;
};

const CrashContext = createContext<MatchOperationResourceName | null>(null);

function scenarioFor(
  resource: MatchOperationResourceName,
  failureResource: MatchOperationResourceName | null,
  scenario: MatchOperationReadScenario,
): MatchOperationReadScenario {
  return failureResource === resource ? scenario : "normal";
}

function resourceName(label: string): MatchOperationResourceName {
  return label === "match summary" ? "summary" : (label as MatchOperationResourceName);
}

function ResourceBoundary<TValue>({
  label,
  resource,
  retry,
  children,
}: {
  label: string;
  resource: MatchResource<MatchResourceData<TValue>>;
  retry: () => void;
  children: (value: TValue, state: MatchResource<MatchResourceData<TValue>>["state"]) => ReactNode;
}) {
  const crashWidget = useContext(CrashContext);
  const name = resourceName(label);
  let content: ReactNode;

  if (resource.data) {
    content = (
      <div className={styles.resourceBoundary} data-resource-state={resource.state}>
        {resource.state === "stale" || resource.state === "retrying" ? (
          <p className={styles.resourceNotice}>{label}: showing cached data while refreshing.</p>
        ) : null}
        {children(resource.data.value, resource.state)}
      </div>
    );
  } else if (resource.state === "loading") {
    content = (
      <section className={styles.resourceStateCard} aria-label={`${label} loading`}>
        <span className={styles.resourcePulse} />
        <strong>Loading {label}</strong>
        <p>This panel loads independently.</p>
      </section>
    );
  } else {
    content = (
      <section className={styles.resourceStateCard} data-resource-state={resource.state}>
        <strong>{label} unavailable</strong>
        <p>
          {resource.state.replaceAll("_", " ")}
          {resource.requestId ? ` · Error ID ${resource.requestId}` : ""}
        </p>
        {resource.canRetry ? (
          <button onClick={retry} type="button">
            Retry {label}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <MatchWidgetBoundary name={label}>
      <MatchWidgetCrashProbe active={crashWidget === name} name={label} />
      {content}
    </MatchWidgetBoundary>
  );
}

export function MatchOperationsResourceScreen({
  initialMatch,
  failureResource,
  scenario,
  resourceState,
  crashWidget,
  viewerRole,
}: MatchOperationsResourceScreenProps) {
  const id = initialMatch.id;
  const state = resourceState;

  const summaryQuery = useQuery(
    matchSummaryQueryOptions(id, state, scenarioFor("summary", failureResource, scenario)),
  );
  const participantsQuery = useQuery(
    matchParticipantsQueryOptions(
      id,
      state,
      scenarioFor("participants", failureResource, scenario),
    ),
  );
  const timelineQuery = useQuery(
    matchTimelineQueryOptions(id, state, scenarioFor("timeline", failureResource, scenario)),
  );
  const clockQuery = useQuery(
    matchClockQueryOptions(id, state, scenarioFor("clock", failureResource, scenario)),
  );
  const checkInQuery = useQuery(
    matchCheckInQueryOptions(id, state, scenarioFor("check-in", failureResource, scenario)),
  );
  const lobbyQuery = useQuery(
    matchLobbyQueryOptions(id, state, scenarioFor("lobby", failureResource, scenario)),
  );
  const resultQuery = useQuery(
    matchResultQueryOptions(id, state, scenarioFor("result", failureResource, scenario)),
  );
  const evidenceQuery = useQuery(
    matchEvidenceQueryOptions(id, state, scenarioFor("evidence", failureResource, scenario)),
  );
  const disputeQuery = useQuery(
    matchDisputeQueryOptions(id, state, scenarioFor("dispute", failureResource, scenario)),
  );
  const supportQuery = useQuery(
    matchSupportQueryOptions(id, state, scenarioFor("support", failureResource, scenario)),
  );

  const summary = matchResourceFromQuery(summaryQuery);
  const participants = matchResourceFromQuery(participantsQuery);
  const timeline = matchResourceFromQuery(timelineQuery);
  const clock = matchResourceFromQuery(clockQuery);
  const checkIn = matchResourceFromQuery(checkInQuery);
  const lobby = matchResourceFromQuery(lobbyQuery);
  const result = matchResourceFromQuery(resultQuery);
  const evidence = matchResourceFromQuery(evidenceQuery);
  const dispute = matchResourceFromQuery(disputeQuery);
  const support = matchResourceFromQuery(supportQuery);
  const currentClock = clock.data?.value ?? initialMatch.clock;
  const authoritativeState = summary.data?.value.state ?? initialMatch.state;
  const authoritativeVersion = summary.data?.value.matchVersion ?? initialMatch.matchVersion;
  const currentUserCheckedIn =
    participants.data?.value.home.checkedIn ?? initialMatch.home.checkedIn;
  const opponentCheckedIn = participants.data?.value.away.checkedIn ?? initialMatch.away.checkedIn;
  const workflow = getMatchWorkflowSections(authoritativeState);

  return (
    <CrashContext.Provider value={crashWidget}>
      <main
        className={styles.page}
        data-m7-stage="7.8"
        data-match-operation-state={authoritativeState}
      >
        <ResourceBoundary
          label="match summary"
          resource={summary}
          retry={() => void summaryQuery.refetch()}
        >
          {(value) => <MatchHeader match={{ ...initialMatch, ...value, clock: currentClock }} />}
        </ResourceBoundary>


        <ResourceBoundary
          label="participants"
          resource={participants}
          retry={() => void participantsQuery.refetch()}
        >
          {(value) => (
            <ParticipantPanel match={{ ...initialMatch, ...value, clock: currentClock }} />
          )}
        </ResourceBoundary>

        <div className={styles.operationsGrid}>
          <ResourceBoundary
            label="timeline"
            resource={timeline}
            retry={() => void timelineQuery.refetch()}
          >
            {(value) => (
              <MatchTimeline match={{ ...initialMatch, ...value, clock: currentClock }} />
            )}
          </ResourceBoundary>

          <div className={styles.primaryColumn}>
{workflow.checkIn ? (
            <ResourceBoundary
              label="check-in"
              resource={checkIn}
              retry={() => void checkInQuery.refetch()}
            >
              {(value) => (
                <CheckInMutationPanel
                  clock={currentClock}
                  currentState={authoritativeState}
                  currentUserCheckedIn={currentUserCheckedIn}
                  matchId={id}
                  matchVersion={authoritativeVersion}
                  opponentCheckedIn={opponentCheckedIn}
                  seedState={state}
                  value={value}
                />
              )}
            </ResourceBoundary>
            ) : null}

{workflow.lobby ? (
            <ResourceBoundary
              label="lobby"
              resource={lobby}
              retry={() => void lobbyQuery.refetch()}
            >
              {(value) => (
                <LobbyOperationsPanel
                  clock={currentClock}
                  currentState={authoritativeState}
                  matchId={id}
                  matchVersion={authoritativeVersion}
                  seedState={state}
                  value={value}
                />
              )}
            </ResourceBoundary>
            ) : null}

{workflow.terminal ? (
            <MatchWidgetBoundary name="terminal control">
              <TerminalOperationsPanel
                currentState={authoritativeState}
                matchId={id}
                matchVersion={authoritativeVersion}
                seedState={state}
                viewerRole={viewerRole}
              />
            </MatchWidgetBoundary>
            ) : null}

{workflow.result ? (
            <ResourceBoundary
              label="result"
              resource={result}
              retry={() => void resultQuery.refetch()}
            >
              {(value) => (
                <ResultOperationsPanel
                  currentState={authoritativeState}
                  matchId={id}
                  matchVersion={authoritativeVersion}
                  seedState={state}
                  value={value}
                />
              )}
            </ResourceBoundary>
            ) : null}

{workflow.dispute ? (
            <ResourceBoundary
              label="dispute"
              resource={dispute}
              retry={() => void disputeQuery.refetch()}
            >
              {(value) => (
                <DisputeOperationsPanel
                  currentState={authoritativeState}
                  matchId={id}
                  matchVersion={authoritativeVersion}
                  seedState={state}
                  value={value}
                />
              )}
            </ResourceBoundary>
            ) : null}

{workflow.evidence ? (
            <ResourceBoundary
              label="evidence"
              resource={evidence}
              retry={() => void evidenceQuery.refetch()}
            >
              {(value) => (
                <EvidenceUploadPanel
                  currentState={authoritativeState}
                  matchId={id}
                  matchVersion={authoritativeVersion}
                  seedState={state}
                  value={value}
                />
              )}
            </ResourceBoundary>
            ) : null}
          </div>

          <ResourceBoundary
            label="support"
            resource={support}
            retry={() => void supportQuery.refetch()}
          >
            {(value) => (
              <MatchSupportPanel
                match={{
                  ...initialMatch,
                  id: value.matchId,
                  gameLabel: value.gameLabel,
                  formatLabel: value.formatLabel,
                  lobbyCode: value.lobbyCode,
                  clock: currentClock,
                }}
              />
            )}
          </ResourceBoundary>
        </div>
      </main>
    </CrashContext.Provider>
  );
}
