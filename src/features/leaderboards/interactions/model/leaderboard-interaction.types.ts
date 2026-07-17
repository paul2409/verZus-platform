// VERZUS M8.8 LEADERBOARD INTERACTION AND INTEL TYPES

import type { LeaderboardFoundationRow } from "../../foundation/model/leaderboard-foundation.types";

export const leaderboardIntelKinds = ["player", "crew", "match"] as const;
export type LeaderboardIntelKind = (typeof leaderboardIntelKinds)[number];

export type LeaderboardIntelSelection = {
  kind: LeaderboardIntelKind;
  entityId: string;
};

export type LeaderboardIntelQueryInput = {
  intel?: string | string[];
  entityId?: string | string[];
};

export type LeaderboardEntityDescriptor = LeaderboardIntelSelection & {
  label: string;
  fullRoute: string | null;
};

export type LeaderboardRowInteractions = {
  identity: LeaderboardEntityDescriptor | null;
  affiliation: LeaderboardEntityDescriptor | null;
  recentMatch: LeaderboardEntityDescriptor;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeEntityId(value: string | undefined): string | null {
  if (!value || !/^[a-z0-9][a-z0-9-]{1,95}$/i.test(value)) return null;
  return value;
}

export function parseLeaderboardIntelSelection(
  input: LeaderboardIntelQueryInput,
): LeaderboardIntelSelection | null {
  const kind = firstValue(input.intel);
  const entityId = safeEntityId(firstValue(input.entityId));

  if (!leaderboardIntelKinds.includes(kind as LeaderboardIntelKind) || !entityId) return null;
  return { kind: kind as LeaderboardIntelKind, entityId };
}

export function slugifyLeaderboardEntity(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

function stableNumber(value: string): number {
  let total = 0;
  for (const character of value) total = (total * 31 + character.charCodeAt(0)) % 10000;
  return total;
}

export function getLeaderboardRowInteractions(
  row: LeaderboardFoundationRow,
): LeaderboardRowInteractions {
  const identity =
    row.entityType === "player"
      ? {
          kind: "player" as const,
          entityId: row.id,
          label: row.name,
          fullRoute: null,
        }
      : row.entityType === "crew"
        ? {
            kind: "crew" as const,
            entityId: row.id,
            label: row.name,
            fullRoute: null,
          }
        : null;

  const affiliation =
    row.entityType === "player" && row.crewName
      ? {
          kind: "crew" as const,
          entityId: `crew-${slugifyLeaderboardEntity(row.crewName)}`,
          label: row.crewName,
          fullRoute: null,
        }
      : null;

  const matchNumber = 7000 + (stableNumber(row.id) % 2999);
  const recentMatch = {
    kind: "match" as const,
    entityId: `match-${slugifyLeaderboardEntity(row.id)}`,
    label: `#${matchNumber}`,
    fullRoute: `/matches/match-${slugifyLeaderboardEntity(row.id)}`,
  };

  return { identity, affiliation, recentMatch };
}

export function findLeaderboardIntelSubject(
  selection: LeaderboardIntelSelection,
  rows: readonly LeaderboardFoundationRow[],
): { descriptor: LeaderboardEntityDescriptor; row: LeaderboardFoundationRow } | null {
  for (const row of rows) {
    const interactions = getLeaderboardRowInteractions(row);
    for (const descriptor of [
      interactions.identity,
      interactions.affiliation,
      interactions.recentMatch,
    ]) {
      if (
        descriptor &&
        descriptor.kind === selection.kind &&
        descriptor.entityId === selection.entityId
      ) {
        return { descriptor, row };
      }
    }
  }
  return null;
}

export function buildLeaderboardIntelHref(
  pathname: string,
  search: string | { toString(): string },
  selection: LeaderboardIntelSelection | null,
): string {
  const params = new URLSearchParams(typeof search === "string" ? search : search.toString());
  if (selection) {
    params.set("intel", selection.kind);
    params.set("entityId", selection.entityId);
  } else {
    params.delete("intel");
    params.delete("entityId");
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
