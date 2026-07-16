import { competitionDetailMockById } from "../../details/mocks/competition-detail.mock";
import type { CompetitionDetailScenario } from "../../details/model/competition-detail.types";
import { competitionEntryCommandRawSchema } from "../api/competition-entry-api.schema";
import type { CompetitionEntryRecordRaw } from "../api/competition-entry-api.schema";
import type { StoredCompetitionEntry } from "./mock-competition-entry.cookie";

interface MockCompetitionEntryInput {
  competitionId: string;
  scenario: CompetitionDetailScenario;
  storedEntries: StoredCompetitionEntry[];
  now?: string;
}

interface MockCompetitionEntryMutationInput extends MockCompetitionEntryInput {
  payload: unknown;
  idempotencyHeader: string | null;
}

export type MockCompetitionEntryDecision = {
  status: number;
  body: unknown;
  entriesToPersist: StoredCompetitionEntry[] | null;
};

function requestId(resource: string) {
  return `mock-competition-entry-${resource}-${globalThis.crypto.randomUUID()}`;
}

function failure(
  status: number,
  code: string,
  message: string,
  retryable: boolean,
): MockCompetitionEntryDecision {
  return {
    status,
    entriesToPersist: null,
    body: {
      ok: false,
      error: {
        code,
        message,
        request_id: requestId(code),
        retryable,
        field_errors: {},
      },
    },
  };
}

function formatRegisteredAt(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  })
    .format(date)
    .toUpperCase();
}

function rawEntry(entry: StoredCompetitionEntry): CompetitionEntryRecordRaw {
  return {
    entry_id: entry.entryId,
    competition_id: entry.competitionId,
    competition_name: entry.competitionName,
    state: "confirmed",
    state_label: "CONFIRMED",
    entrant_label: entry.entrantLabel,
    team_label: entry.teamLabel,
    registered_at: entry.registeredAt,
    registered_at_label: formatRegisteredAt(entry.registeredAt),
    registration_code: entry.registrationCode,
    entry_fee_label: entry.entryFeeLabel,
    check_in_label: entry.checkInLabel,
  };
}

function seededEntry(competitionId: string): StoredCompetitionEntry | null {
  if (competitionId !== "league-of-legends-ranked-open") return null;

  return {
    entryId: "league-ranked-open-entry",
    competitionId,
    competitionName: "LEAGUE OF LEGENDS RANKED OPEN",
    entrantLabel: "JAYFLEX",
    teamLabel: "TEAM: ELEVATE",
    registeredAt: "2026-07-15T18:20:00.000+01:00",
    registrationCode: "VZ-LOL-2408",
    idempotencyKey: "7d45ca07-5ed1-4635-a7d9-d934a698cf31",
    stateVersion: `${competitionId}:registration_open:v1`,
    entryFeeLabel: "1,000 VS CREDITS",
    checkInLabel: "CHECK-IN: JUL 19 · 17:30 WAT",
  };
}

function findExisting(
  competitionId: string,
  storedEntries: StoredCompetitionEntry[],
): StoredCompetitionEntry | null {
  return (
    [...storedEntries].reverse().find((entry) => entry.competitionId === competitionId) ??
    seededEntry(competitionId)
  );
}

function detailFor(competitionId: string) {
  return competitionDetailMockById[competitionId] ?? null;
}

function parseCapacity(label: string) {
  const match = label.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { current: 0, maximum: Number.POSITIVE_INFINITY };
  return { current: Number(match[1]), maximum: Number(match[2]) };
}

function lifecycleFor(statusLabel: string) {
  if (statusLabel === "REGISTRATION OPEN") return "registration_open" as const;
  return "scheduled" as const;
}

function controlFor(competitionId: string, storedEntries: StoredCompetitionEntry[]) {
  const detail = detailFor(competitionId);
  if (!detail) return null;

  const existingEntry = findExisting(competitionId, storedEntries);
  const lifecycleState = lifecycleFor(detail.summary.statusLabel);
  const capacity = parseCapacity(detail.summary.capacityLabel);
  const full = capacity.current >= capacity.maximum;
  const eligible = detail.eligibility.state === "eligible";
  const registrationOpen = lifecycleState === "registration_open";
  const checkIn = detail.schedule.stages.find((stage) => stage.id === "check-in");
  const checkInLabel = checkIn
    ? `CHECK-IN: ${checkIn.dateLabel} · ${checkIn.timeLabel} WAT`
    : "CHECK-IN SCHEDULE PENDING";
  const stateVersion = `${competitionId}:${lifecycleState}:v1`;

  return {
    detail,
    existingEntry,
    full,
    lifecycleState,
    stateVersion,
    checkInLabel,
    canEnter: registrationOpen && eligible && !full && !existingEntry,
  };
}

function meta(request: string, now: string, scenario: CompetitionDetailScenario) {
  return {
    request_id: request,
    meta: {
      server_now: now,
      last_updated_at: now,
      freshness: scenario === "stale" ? ("stale" as const) : ("fresh" as const),
    },
  };
}

function scenarioFailure(scenario: CompetitionDetailScenario): MockCompetitionEntryDecision | null {
  if (scenario === "offline") {
    return failure(503, "offline", "Competition entry is unavailable while offline.", true);
  }
  if (scenario === "maintenance") {
    return failure(503, "maintenance", "Competition entry is under maintenance.", true);
  }
  if (scenario === "unauthorized") {
    return failure(401, "unauthorized", "Sign in before entering a competition.", false);
  }
  if (scenario === "forbidden") {
    return failure(403, "forbidden", "Competition entry is restricted for this account.", false);
  }
  if (scenario === "not_found") {
    return failure(404, "not_found", "Competition not found.", false);
  }
  return null;
}

export function getMockCompetitionEntryControl({
  competitionId,
  scenario,
  storedEntries,
  now = new Date().toISOString(),
}: MockCompetitionEntryInput): MockCompetitionEntryDecision {
  const forcedFailure = scenarioFailure(scenario);
  if (forcedFailure) return forcedFailure;

  const control = controlFor(competitionId, storedEntries);
  if (!control) return failure(404, "not_found", "Competition not found.", false);

  if (scenario === "malformed") {
    return {
      status: 200,
      entriesToPersist: null,
      body: { ok: true, data: { invalid: true } },
    };
  }

  const { detail, existingEntry, lifecycleState, stateVersion, checkInLabel, canEnter, full } =
    control;

  const summary = full
    ? "This competition has reached capacity."
    : existingEntry
      ? "Your confirmed entry is available to manage."
      : detail.eligibility.summary;

  return {
    status: 200,
    entriesToPersist: null,
    body: {
      ok: true,
      data: {
        competition_id: competitionId,
        competition_name: detail.summary.name,
        lifecycle_state: lifecycleState,
        lifecycle_label: detail.summary.statusLabel,
        state_version: stateVersion,
        can_enter: canEnter,
        eligibility_state: detail.eligibility.state,
        eligibility_label: detail.eligibility.label,
        eligibility_summary: summary,
        entrant_label: "JAYFLEX",
        team_label: detail.summary.teamSizeLabel === "1V1" ? "SOLO ENTRY" : "TEAM: ELEVATE",
        game_label: detail.summary.gameLabel,
        format_label: detail.summary.formatLabel,
        entry_fee_label: detail.summary.entryFeeLabel,
        roster_lock_label: "ROSTER LOCKS WHEN CHECK-IN OPENS",
        check_in_label: checkInLabel,
        existing_entry: existingEntry ? rawEntry(existingEntry) : null,
      },
      ...meta(requestId("control"), now, scenario),
    },
  };
}

function registrationCode(competitionId: string, entryId: string) {
  const prefix = competitionId
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "X")
    .join("");
  return `VZ-${prefix}-${entryId.replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

function mutationSuccess(
  entry: StoredCompetitionEntry,
  scenario: CompetitionDetailScenario,
  now: string,
  duplicate: boolean,
  alreadyEntered: boolean,
  entriesToPersist: StoredCompetitionEntry[] | null,
): MockCompetitionEntryDecision {
  return {
    status: duplicate || alreadyEntered ? 200 : 201,
    entriesToPersist,
    body: {
      ok: true,
      data: {
        entry: rawEntry(entry),
        duplicate,
        already_entered: alreadyEntered,
      },
      ...meta(requestId("confirm"), now, scenario),
    },
  };
}

export function decideMockCompetitionEntry({
  competitionId,
  scenario,
  storedEntries,
  payload,
  idempotencyHeader,
  now = new Date().toISOString(),
}: MockCompetitionEntryMutationInput): MockCompetitionEntryDecision {
  const forcedFailure = scenarioFailure(scenario);
  if (forcedFailure) return forcedFailure;

  const command = competitionEntryCommandRawSchema.safeParse(payload);
  if (!command.success) {
    return failure(
      400,
      "invalid_entry_command",
      "The competition entry request is invalid.",
      false,
    );
  }

  if (!idempotencyHeader) {
    return failure(
      400,
      "idempotency_key_required",
      "Competition entry requires an Idempotency-Key header.",
      false,
    );
  }

  if (idempotencyHeader !== command.data.idempotency_key) {
    return failure(
      400,
      "idempotency_key_mismatch",
      "The entry header and request key do not match.",
      false,
    );
  }

  if (competitionId !== command.data.competition_id) {
    return failure(
      400,
      "competition_id_mismatch",
      "The competition route and body do not match.",
      false,
    );
  }

  const control = controlFor(competitionId, storedEntries);
  if (!control) return failure(404, "not_found", "Competition not found.", false);

  const existingEntry = control.existingEntry;
  if (existingEntry?.idempotencyKey === command.data.idempotency_key) {
    return mutationSuccess(existingEntry, scenario, now, true, true, null);
  }

  if (existingEntry) {
    return mutationSuccess(existingEntry, scenario, now, false, true, null);
  }

  if (command.data.expected_state_version !== control.stateVersion) {
    return failure(
      409,
      "stale_competition_state",
      "The competition entry state changed. Refresh before retrying.",
      true,
    );
  }

  if (control.lifecycleState !== "registration_open") {
    return failure(409, "registration_closed", "Registration is not open.", false);
  }

  if (control.full) {
    return failure(409, "competition_full", "This competition has reached capacity.", false);
  }

  if (control.detail.eligibility.state !== "eligible") {
    return failure(403, "not_eligible", "The current player is not eligible to enter.", false);
  }

  const entryId = globalThis.crypto.randomUUID();
  const entry: StoredCompetitionEntry = {
    entryId,
    competitionId,
    competitionName: control.detail.summary.name,
    entrantLabel: "JAYFLEX",
    teamLabel: control.detail.summary.teamSizeLabel === "1V1" ? "SOLO ENTRY" : "TEAM: ELEVATE",
    registeredAt: now,
    registrationCode: registrationCode(competitionId, entryId),
    idempotencyKey: command.data.idempotency_key,
    stateVersion: control.stateVersion,
    entryFeeLabel: control.detail.summary.entryFeeLabel,
    checkInLabel: control.checkInLabel,
  };

  return mutationSuccess(entry, scenario, now, false, false, [...storedEntries, entry]);
}

export function latestCompetitionEntryForDiscovery(
  storedEntries: StoredCompetitionEntry[],
): StoredCompetitionEntry {
  return storedEntries.at(-1) ?? seededEntry("league-of-legends-ranked-open")!;
}
