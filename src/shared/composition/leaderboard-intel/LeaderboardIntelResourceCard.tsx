"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import type { IntelCardState } from "@/components/primitives/intel-card";
import { CrewIntelCard } from "@/features/crews/intel-card";
import {
  CrewIntelResourceError,
  crewIntelQueryOptions,
} from "@/features/crews/intel-card/resource";
import { MatchIntelCard } from "@/features/matches/intel-card";
import {
  MatchIntelResourceError,
  matchIntelQueryOptions,
} from "@/features/matches/intel-card/resource";
import { PlayerIntelCard } from "@/features/profiles/intel-card";
import {
  PlayerIntelResourceError,
  playerIntelQueryOptions,
} from "@/features/profiles/intel-card/resource";

import { recordLeaderboardIntelTelemetry } from "@/features/leaderboards/telemetry";
import type { LeaderboardIntelSelection } from "@/features/leaderboards/interactions/model/leaderboard-interaction.types";
import styles from "@/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css";

function cardStateForFreshness(freshness: "fresh" | "stale" | "partial"): IntelCardState {
  if (freshness === "stale") return "stale";
  if (freshness === "partial") return "partial";
  return "default";
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
  const entityId = selection.entityId;
  const lastTelemetryKeyRef = useRef<string | null>(null);

  const playerQuery = useQuery({
    ...playerIntelQueryOptions(entityId),
    enabled: selection.kind === "player",
  });
  const crewQuery = useQuery({
    ...crewIntelQueryOptions(entityId),
    enabled: selection.kind === "crew",
  });
  const matchQuery = useQuery({
    ...matchIntelQueryOptions(entityId),
    enabled: selection.kind === "match",
  });

  const activeQuery =
    selection.kind === "player" ? playerQuery : selection.kind === "crew" ? crewQuery : matchQuery;

  useEffect(() => {
    const status = activeQuery.isError ? "error" : activeQuery.isSuccess ? "success" : "pending";
    if (status === "pending") return;
    const requestId = activeQuery.isSuccess
      ? activeQuery.data.requestId
      : requestIdForError(activeQuery.error);
    const key = `${selection.kind}:${entityId}:${status}:${requestId ?? "none"}`;
    if (lastTelemetryKeyRef.current === key) return;
    lastTelemetryKeyRef.current = key;
    recordLeaderboardIntelTelemetry(
      status === "success" ? "intel_load_succeeded" : "intel_load_failed",
      selection.kind,
      entityId,
      { requestId },
    );
  }, [
    activeQuery.data,
    activeQuery.error,
    activeQuery.isError,
    activeQuery.isSuccess,
    entityId,
    selection.kind,
  ]);

  if (selection.kind === "player") {
    if (playerQuery.isPending) return <IntelLoading label="Loading verified player intel" />;
    if (playerQuery.isError) {
      return (
        <ResourceRecovery
          entityId={entityId}
          entityKind="player"
          requestId={requestIdForError(playerQuery.error)}
          retry={() => void playerQuery.refetch()}
        />
      );
    }
    return (
      <ResourceSuccess fetchedAt={playerQuery.data.fetchedAt} requestId={playerQuery.data.requestId}>
        <PlayerIntelCard
          model={playerQuery.data.model}
          state={cardStateForFreshness(playerQuery.data.freshness)}
        />
      </ResourceSuccess>
    );
  }

  if (selection.kind === "crew") {
    if (crewQuery.isPending) return <IntelLoading label="Loading verified Crew intel" />;
    if (crewQuery.isError) {
      return (
        <ResourceRecovery
          entityId={entityId}
          entityKind="crew"
          requestId={requestIdForError(crewQuery.error)}
          retry={() => void crewQuery.refetch()}
        />
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

  if (matchQuery.isPending) return <IntelLoading label="Loading authoritative match intel" />;
  if (matchQuery.isError) {
    return (
      <ResourceRecovery
        entityId={entityId}
        entityKind="match"
        requestId={requestIdForError(matchQuery.error)}
        retry={() => void matchQuery.refetch()}
      />
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

function IntelLoading({ label }: { label: string }) {
  return (
    <div className={styles.intelResourceState} role="status">
      <p>{label}…</p>
    </div>
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
}: {
  entityId: string;
  entityKind: LeaderboardIntelSelection["kind"];
  requestId: string | null;
  retry: () => void;
}) {
  const retryWithTelemetry = () => {
    recordLeaderboardIntelTelemetry("intel_retry_requested", entityKind, entityId, { requestId });
    retry();
  };

  return (
    <div className={styles.intelRecovery}>
      <p>
        Verified {entityKind} intel is unavailable.
        {requestId ? ` Reference ${requestId}.` : ""}
      </p>
      <button onClick={retryWithTelemetry} type="button">
        Retry intel
      </button>
    </div>
  );
}
