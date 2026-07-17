// VERZUS M7.2 SERVER CLOCK POLICY

import type {
  MatchClockMode,
  MatchClockSnapshot,
  MatchDeadlineKind,
  MatchOperationState,
} from "./match-operations.types";

const minute = 60_000;
const second = 1_000;
const day = 24 * 60 * minute;

const millisecondsUntilMatchStart: Record<MatchOperationState, number> = {
  scheduled: 2 * day + 6 * 60 * minute + 24 * minute,
  "check-in-unavailable": 65 * minute + 14 * second,
  "check-in-open": 39 * minute + 13 * second,
  "checked-in": 39 * minute + 13 * second,
  "opponent-not-checked-in": 27 * minute + 45 * second,
  "both-ready": 14 * minute + 12 * second,
  "lobby-open": 7 * minute + 48 * second,
  "in-progress": -(12 * minute + 34 * second),
  "submit-result": -42 * minute,
  "awaiting-opponent-confirmation": -46 * minute,
  "result-confirmed": -50 * minute,
  disputed: -49 * minute,
  forfeit: -45 * minute,
  cancelled: 10 * minute,
  completed: -50 * minute,
};

const activeClockPolicy: Record<
  MatchOperationState,
  { kind: MatchDeadlineKind; mode: MatchClockMode }
> = {
  scheduled: { kind: "match_starts", mode: "countdown" },
  "check-in-unavailable": { kind: "check_in_opens", mode: "countdown" },
  "check-in-open": { kind: "check_in_closes", mode: "countdown" },
  "checked-in": { kind: "check_in_closes", mode: "countdown" },
  "opponent-not-checked-in": { kind: "check_in_closes", mode: "countdown" },
  "both-ready": { kind: "lobby_opens", mode: "countdown" },
  "lobby-open": { kind: "match_starts", mode: "countdown" },
  "in-progress": { kind: "match_starts", mode: "elapsed" },
  "submit-result": { kind: null, mode: "none" },
  "awaiting-opponent-confirmation": { kind: null, mode: "none" },
  "result-confirmed": { kind: null, mode: "none" },
  disputed: { kind: null, mode: "none" },
  forfeit: { kind: null, mode: "none" },
  cancelled: { kind: null, mode: "none" },
  completed: { kind: null, mode: "none" },
};

function toIso(milliseconds: number): string {
  return new Date(milliseconds).toISOString();
}

function resolveDeadlineAt(
  kind: MatchDeadlineKind,
  values: Pick<
    MatchClockSnapshot,
    "checkInOpensAt" | "checkInClosesAt" | "lobbyOpensAt" | "matchStartsAt" | "resultDueAt"
  >,
): string | null {
  switch (kind) {
    case "check_in_opens":
      return values.checkInOpensAt;
    case "check_in_closes":
      return values.checkInClosesAt;
    case "lobby_opens":
      return values.lobbyOpensAt;
    case "match_starts":
      return values.matchStartsAt;
    case "result_due":
      return values.resultDueAt;
    case null:
      return null;
  }
}

export function createMatchClockSnapshot(
  matchId: string,
  state: MatchOperationState,
  serverNow: Date = new Date(),
  matchVersion = 12,
): MatchClockSnapshot {
  const nowMs = serverNow.getTime();
  const matchStartsAtMs = nowMs + millisecondsUntilMatchStart[state];
  const values = {
    checkInOpensAt: toIso(matchStartsAtMs - 40 * minute),
    checkInClosesAt: toIso(matchStartsAtMs - 15 * minute),
    lobbyOpensAt: toIso(matchStartsAtMs - 10 * minute),
    matchStartsAt: toIso(matchStartsAtMs),
    resultDueAt: toIso(matchStartsAtMs + 60 * minute),
  };
  const policy = activeClockPolicy[state];

  return {
    matchId,
    state,
    matchVersion,
    serverNow: serverNow.toISOString(),
    issuedAt: serverNow.toISOString(),
    scheduledAt: values.matchStartsAt,
    ...values,
    activeDeadlineKind: policy.kind,
    activeDeadlineAt: resolveDeadlineAt(policy.kind, values),
    mode: policy.mode,
    timezone: "UTC",
  };
}

export function formatMatchClockValue(milliseconds: number, includeDays = false): string {
  const safe = Math.max(0, Math.floor(milliseconds / 1_000));
  const days = Math.floor(safe / 86_400);
  const hours = Math.floor((safe % 86_400) / 3_600);
  const minutes = Math.floor((safe % 3_600) / 60);
  const seconds = safe % 60;

  if (includeDays || days > 0) {
    return `${String(days).padStart(2, "0")}D ${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M`;
  }

  return `${String(hours).padStart(2, "0")}H ${String(minutes).padStart(2, "0")}M ${String(seconds).padStart(2, "0")}S`;
}

export function formatMatchServerTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatMatchTimelineTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}
