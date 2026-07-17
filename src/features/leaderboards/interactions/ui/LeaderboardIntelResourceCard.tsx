"use client";

// VERZUS M8.9 API-BACKED DOMAIN INTEL CARD HOST

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import type { IntelCardState } from "@/components/primitives/intel-card";
import { CrewIntelCard, crewIntelMock } from "@/features/crews/intel-card";
import {
  CrewIntelResourceError,
  crewIntelQueryOptions,
  type CrewIntelResourceScenario,
} from "@/features/crews/intel-card/resource";
import { MatchIntelCard, matchIntelMock } from "@/features/matches/intel-card";
import {
  MatchIntelResourceError,
  matchIntelQueryOptions,
  type MatchIntelResourceScenario,
} from "@/features/matches/intel-card/resource";
import { PlayerIntelCard, playerIntelMock } from "@/features/profiles/intel-card";
import {
  PlayerIntelResourceError,
  playerIntelQueryOptions,
  type PlayerIntelResourceScenario,
} from "@/features/profiles/intel-card/resource";

import { recordLeaderboardIntelTelemetry } from "../../telemetry";
import type { LeaderboardIntelSelection } from "../model/leaderboard-interaction.types";
import styles from "./LeaderboardInteractions.module.css";

type IntelScenario = PlayerIntelResourceScenario &
  CrewIntelResourceScenario &
  MatchIntelResourceScenario;

function normalizeScenario(value: string | null): IntelScenario {
  switch (value) {
    case "stale":
    case "partial":
    case "error":
    case "not-found":
    case "malformed":
    case "slow":
      return value;
    default:
      return "normal";
  }
}

function cardStateForFreshness(freshness: "fresh" | "stale" | "partial"): IntelCardState {
  if (freshness === "stale") return "stale";
  if (freshness === "partial") return "partial";
  return "default";
}

function cardStateForError(error: unknown): IntelCardState {
  if (
    (error instanceof PlayerIntelResourceError ||
      error instanceof CrewIntelResourceError ||
      error instanceof MatchIntelResourceError) &&
    error.code === "offline"
  ) {
    return "offline";
  }
  return "error";
}

function requestIdForError(error: unknown): string | null {
  if (
    error instanceof PlayerIntelResourceError ||
    error instanceof CrewIntelResourceError ||
    error instanceof MatchIntelResourceError
  ) {
    return error.requestId;
  }
  return null;
}

export function LeaderboardIntelResourceCard({
  selection,
}: {
  selection: LeaderboardIntelSelection;
}) {
  const searchParams = useSearchParams();
  const scenario = normalizeScenario(searchParams.get("intelScenario"));
  const entityId = selection.entityId;
  const lastTelemetryKeyRef = useRef<string | null>(null);

  const playerQuery = useQuery({
    ...playerIntelQueryOptions(entityId, scenario),
    enabled: selection.kind === "player",
  });
  const crewQuery = useQuery({
    ...crewIntelQueryOptions(entityId, scenario),
    enabled: selection.kind === "crew",
  });
  const matchQuery = useQuery({
    ...matchIntelQueryOptions(entityId, scenario),
    enabled: selection.kind === "match",
  });

  // VERZUS M8.10 INTEL LOAD TELEMETRY
  const activeQuery =
    selection.kind === "player" ? playerQuery : selection.kind === "crew" ? crewQuery : matchQuery;

  useEffect(() => {
    const status = activeQuery.isError ? "error" : activeQuery.isSuccess ? "success" : "pending";
    if (status === "pending") return;
    const requestId = activeQuery.isSuccess
      ? activeQuery.data.requestId
      : requestIdForError(activeQuery.error);
    const key = `${selection.kind}:${entityId}:${scenario}:${status}:${requestId ?? "none"}`;
    if (lastTelemetryKeyRef.current === key) return;
    lastTelemetryKeyRef.current = key;
    recordLeaderboardIntelTelemetry(
      status === "success" ? "intel_load_succeeded" : "intel_load_failed",
      selection.kind,
      entityId,
      { scenario, requestId },
    );
  }, [
    activeQuery.data,
    activeQuery.error,
    activeQuery.isError,
    activeQuery.isSuccess,
    entityId,
    scenario,
    selection.kind,
  ]);

  if (selection.kind === "player") {
    if (playerQuery.isPending) {
      return <PlayerIntelCard model={{ ...playerIntelMock, id: entityId }} state="loading" />;
    }
    if (playerQuery.isError) {
      const requestId = requestIdForError(playerQuery.error);
      return (
        <div className={styles.intelResourceState}>
          <PlayerIntelCard
            model={{ ...playerIntelMock, id: entityId, profileHref: `/players/${entityId}` }}
            state={cardStateForError(playerQuery.error)}
          />
          <ResourceRecovery
            entityId={entityId}
            entityKind="player"
            requestId={requestId}
            retry={() => void playerQuery.refetch()}
            scenario={scenario}
          />
        </div>
      );
    }
    return (
      <ResourceSuccess
        fetchedAt={playerQuery.data.fetchedAt}
        requestId={playerQuery.data.requestId}
      >
        <PlayerIntelCard
          model={playerQuery.data.model}
          state={cardStateForFreshness(playerQuery.data.freshness)}
        />
      </ResourceSuccess>
    );
  }

  if (selection.kind === "crew") {
    if (crewQuery.isPending) {
      return <CrewIntelCard model={{ ...crewIntelMock, id: entityId }} state="loading" />;
    }
    if (crewQuery.isError) {
      const requestId = requestIdForError(crewQuery.error);
      return (
        <div className={styles.intelResourceState}>
          <CrewIntelCard
            model={{ ...crewIntelMock, id: entityId, crewHref: `/crews/${entityId}` }}
            state={cardStateForError(crewQuery.error)}
          />
          <ResourceRecovery
            entityId={entityId}
            entityKind="crew"
            requestId={requestId}
            retry={() => void crewQuery.refetch()}
            scenario={scenario}
          />
        </div>
      );
    }
    return (
      <ResourceSuccess fetchedAt={crewQuery.data.fetchedAt} requestId={crewQuery.data.requestId}>
        <CrewIntelCard
          model={crewQuery.data.model}
          state={cardStateForFreshness(crewQuery.data.freshness)}
        />
      </ResourceSuccess>
    );
  }

  if (matchQuery.isPending) {
    return <MatchIntelCard model={{ ...matchIntelMock, id: entityId }} state="loading" />;
  }
  if (matchQuery.isError) {
    const requestId = requestIdForError(matchQuery.error);
    return (
      <div className={styles.intelResourceState}>
        <MatchIntelCard
          model={{ ...matchIntelMock, id: entityId, matchHref: `/matches/${entityId}` }}
          state={cardStateForError(matchQuery.error)}
        />
        <ResourceRecovery
          entityId={entityId}
          entityKind="match"
          requestId={requestId}
          retry={() => void matchQuery.refetch()}
          scenario={scenario}
        />
      </div>
    );
  }
  return (
    <ResourceSuccess fetchedAt={matchQuery.data.fetchedAt} requestId={matchQuery.data.requestId}>
      <MatchIntelCard
        model={matchQuery.data.model}
        state={cardStateForFreshness(matchQuery.data.freshness)}
      />
    </ResourceSuccess>
  );
}

function ResourceSuccess({
  children,
  fetchedAt,
  requestId,
}: {
  children: React.ReactNode;
  fetchedAt: string;
  requestId: string;
}) {
  return (
    <div className={styles.intelResourceState}>
      {children}
      <p className={styles.intelResourceMeta}>
        Validated{" "}
        {new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }).format(new Date(fetchedAt))}{" "}
        UTC · Request {requestId}
      </p>
    </div>
  );
}

function ResourceRecovery({
  entityId,
  entityKind,
  requestId,
  retry,
  scenario,
}: {
  entityId: string;
  entityKind: LeaderboardIntelSelection["kind"];
  requestId: string | null;
  retry: () => void;
  scenario: IntelScenario;
}) {
  const retryWithTelemetry = () => {
    recordLeaderboardIntelTelemetry("intel_retry_requested", entityKind, entityId, {
      scenario,
      requestId,
    });
    retry();
  };

  return (
    <div className={styles.intelRecovery}>
      <p>{requestId ? `Reference ${requestId}` : "Intel request failed independently."}</p>
      <button onClick={retryWithTelemetry} type="button">
        Retry intel
      </button>
    </div>
  );
}
