import "server-only";

import { randomUUID } from "node:crypto";

import { competitionEntryCommandRawSchema } from "../entry/api/competition-entry-api.schema";
import { resolveCompetitionLifecycle } from "../lifecycle/model/competition-lifecycle.policy";
import type { CompetitionLifecycleState } from "../lifecycle/model/competition-lifecycle.types";
import {
  COMPETITION_DISCOVERY_PAGE_SIZE,
  parseCompetitionDiscoverySearchParams,
} from "../discovery/model/competition-discovery.query";
import type {
  CompetitionArtKey,
  CompetitionDiscoveryGame,
  CompetitionDiscoveryItem,
} from "../discovery/model/competition-discovery.types";
import {
  createCompetitionEntry,
  findCompetitionById,
  findCompetitionEntry,
  findCompetitionViewer,
  findFeaturedCompetition,
  findLatestCompetitionEntry,
  listActiveGameOptions,
  listCompetitionDiscovery,
  listCompetitionParticipants,
  type CompetitionEntryRecord,
  type CompetitionLifecycle,
  type CompetitionRecord,
} from "./competition.repository";

export class CompetitionServiceError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: { retryable?: boolean; fieldErrors?: Record<string, string[]> },
  ) {
    super(message);
    this.name = "CompetitionServiceError";
    this.status = status;
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.fieldErrors = options?.fieldErrors ?? {};
  }
}

type RewardBreakdown = { id: string; label: string; value_label: string };
type RuleSection = { id: string; title: string; items: string[] };

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asRewardBreakdown(value: unknown): RewardBreakdown[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { label?: unknown }).label === "string" &&
      typeof (item as { value_label?: unknown }).value_label === "string"
    ) {
      return [item as RewardBreakdown];
    }
    return [];
  });
}

function asRuleSections(value: unknown): RuleSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { title?: unknown }).title === "string" &&
      Array.isArray((item as { items?: unknown }).items)
    ) {
      return [
        {
          id: (item as { id: string }).id,
          title: (item as { title: string }).title,
          items: (item as { items: unknown[] }).items.filter(
            (entry): entry is string => typeof entry === "string",
          ),
        },
      ];
    }
    return [];
  });
}

function lifecycleLabel(lifecycle: CompetitionLifecycle): string {
  return lifecycle.replaceAll("_", " ").toLocaleUpperCase("en");
}

function entryLifecycle(lifecycle: CompetitionLifecycle) {
  if (lifecycle === "draft" || lifecycle === "archived") {
    return lifecycle === "draft" ? ("scheduled" as const) : ("completed" as const);
  }
  return lifecycle;
}

function moneyLabel(currency: string, amount: number): string {
  if (amount <= 0) return "FREE";
  return `${currency} ${Math.round(amount).toLocaleString("en-NG")}`;
}

function prizeLabel(competition: CompetitionRecord): string {
  const value = Number(competition.prize_value);
  return value > 0
    ? `${competition.prize_currency} ${Math.round(value).toLocaleString("en-NG")}`
    : "NO PRIZE POOL";
}

function dateLabel(value: Date | null): string {
  if (!value) return "TO BE ANNOUNCED";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  })
    .format(value)
    .toLocaleUpperCase("en");
}

function timeLabel(value: Date | null): string {
  if (!value) return "TIME PENDING";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  }).format(value);
}

function timingLabel(competition: CompetitionRecord): string {
  if (competition.lifecycle === "in_progress" || competition.lifecycle === "check_in_open") {
    return competition.lifecycle === "in_progress" ? "LIVE NOW" : "CHECK-IN OPEN";
  }
  if (competition.lifecycle === "completed") return "COMPLETED";
  if (competition.lifecycle === "cancelled") return "CANCELLED";
  if (competition.registration_closes_at && competition.registration_closes_at > new Date()) {
    return `REGISTRATION CLOSES ${dateLabel(competition.registration_closes_at)}`;
  }
  return `STARTS ${dateLabel(competition.starts_at)}`;
}

function cardState(competition: CompetitionRecord): "live" | "upcoming" | "entered" {
  if (competition.user_entered) return "entered";
  return competition.lifecycle === "check_in_open" || competition.lifecycle === "in_progress"
    ? "live"
    : "upcoming";
}

function stateVersion(competition: CompetitionRecord): string {
  return `${competition.id}:${competition.lifecycle}:v${competition.version}`;
}

function parseStateVersion(value: string): number | null {
  const match = value.match(/:v(\d+)$/);
  if (!match) return null;
  const parsed = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function competitionItem(competition: CompetitionRecord): CompetitionDiscoveryItem {
  const remaining = Math.max(0, competition.capacity - competition.registered_count);
  return {
    id: competition.id,
    name: competition.name,
    game: competition.game_name,
    gameFilterValue: competition.game_filter_value,
    teamSize: competition.team_size,
    format: competition.format_label,
    state: cardState(competition),
    statusLabel: lifecycleLabel(competition.lifecycle),
    capacityLabel: `${competition.registered_count} / ${competition.capacity} ENTRIES`,
    timingLabel: timingLabel(competition),
    prizePoolLabel: prizeLabel(competition),
    entryFeeLabel: moneyLabel(competition.entry_fee_currency, competition.entry_fee_amount),
    entryFeeType: competition.entry_fee_amount === 0 ? "free" : "paid",
    popularity: competition.registered_count,
    startsAtOrder: Math.max(0, competition.starts_at.getTime()),
    prizeValue: Number(competition.prize_value),
    remainingCapacity: remaining,
    searchTerms: [
      competition.game_name,
      competition.format_label,
      competition.region_label,
      ...asStringArray(competition.tags),
    ],
    artKey: competition.art_key,
  };
}

function itemRaw(item: CompetitionDiscoveryItem) {
  return {
    competition_id: item.id,
    name: item.name,
    game: item.game,
    game_filter_value: item.gameFilterValue,
    team_size: item.teamSize,
    format: item.format,
    state: item.state,
    status_label: item.statusLabel,
    capacity_label: item.capacityLabel,
    timing_label: item.timingLabel,
    prize_pool_label: item.prizePoolLabel ?? null,
    entry_fee_label: item.entryFeeLabel,
    entry_fee_type: item.entryFeeType,
    popularity: item.popularity,
    starts_at_order: item.startsAtOrder,
    prize_value: item.prizeValue,
    remaining_capacity: item.remainingCapacity,
    search_terms: item.searchTerms,
    art_key: item.artKey,
  };
}

function featuredRaw(competition: CompetitionRecord) {
  return {
    competition_id: competition.id,
    eyebrow: competition.eyebrow,
    name: competition.name,
    season_label: competition.season_label,
    week_label: competition.week_label,
    game_label: competition.game_name,
    format_label: competition.format_label,
    prize_pool_label: prizeLabel(competition),
    reward_note: competition.reward_note,
    countdown_label: timingLabel(competition),
    status_label: lifecycleLabel(competition.lifecycle),
    art_key: competition.art_key,
  };
}

function entryFeeLabel(competition: CompetitionRecord | CompetitionEntryRecord): string {
  return moneyLabel(competition.entry_fee_currency, competition.entry_fee_amount);
}

function registeredAtLabel(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos",
  })
    .format(value)
    .toLocaleUpperCase("en");
}

function entryRaw(entry: CompetitionEntryRecord) {
  return {
    entry_id: entry.id,
    competition_id: entry.competition_id,
    competition_name: entry.competition_name,
    state: "confirmed" as const,
    state_label: "CONFIRMED",
    entrant_label: entry.display_name || entry.gamer_tag,
    team_label: entry.team_size === "1V1" ? "SOLO ENTRY" : "TEAM ENTRY",
    registered_at: entry.registered_at.toISOString(),
    registered_at_label: registeredAtLabel(entry.registered_at),
    registration_code: entry.registration_code,
    entry_fee_label: entryFeeLabel(entry),
    check_in_label: entry.check_in_opens_at
      ? `CHECK-IN: ${dateLabel(entry.check_in_opens_at)} · ${timeLabel(entry.check_in_opens_at)} WAT`
      : "CHECK-IN SCHEDULE PENDING",
  };
}

async function eligibility(competition: CompetitionRecord, userId: string) {
  const viewer = await findCompetitionViewer(userId, competition.game_id);
  if (!viewer) {
    throw new CompetitionServiceError(403, "forbidden", "A player profile is required.");
  }

  const checks = [
    {
      id: "game-identity",
      label: "GAME IDENTITY",
      detail: viewer.has_game_identity
        ? `A ${competition.game_name} identity is connected.`
        : `Connect a ${competition.game_name} identity before entering.`,
      met: viewer.has_game_identity,
    },
    {
      id: "region",
      label: "REGION",
      detail:
        !competition.region_code || competition.region_code === viewer.country_code
          ? `Your profile satisfies the ${competition.region_label} region requirement.`
          : `This competition is restricted to ${competition.region_label}.`,
      met: !competition.region_code || competition.region_code === viewer.country_code,
    },
    {
      id: "trust",
      label: "TRUST SCORE",
      detail: `Required ${Number(competition.minimum_trust_score).toFixed(0)} · Current ${Number(viewer.trust_score).toFixed(0)}`,
      met: Number(viewer.trust_score) >= Number(competition.minimum_trust_score),
    },
    {
      id: "roster",
      label: "ENTRY TYPE",
      detail:
        competition.team_size === "1V1"
          ? "This competition accepts solo entries."
          : "Team entries become available after the Crew domain cutover.",
      met: competition.team_size === "1V1",
    },
  ];

  const met = checks.every((check) => check.met);
  return {
    state: met ? ("eligible" as const) : ("not_eligible" as const),
    label: met ? "ELIGIBLE" : "NOT ELIGIBLE",
    summary: met
      ? "Your current player identity satisfies the entry requirements."
      : "Complete the unmet requirements before entering this competition.",
    checks,
    viewer,
  };
}

export async function getCompetitionDiscoveryList(userId: string, params: URLSearchParams) {
  const filters = parseCompetitionDiscoverySearchParams(params);
  const result = await listCompetitionDiscovery(userId, {
    ...filters,
    pageSize: COMPETITION_DISCOVERY_PAGE_SIZE,
  });
  return {
    items: result.items.map(competitionItem).map(itemRaw),
    page: result.page,
    page_count: result.pageCount,
    total: result.total,
    has_previous_page: result.page > 1,
    has_next_page: result.page < result.pageCount,
  };
}

export async function getFeaturedCompetition(userId: string) {
  const competition = await findFeaturedCompetition(userId);
  return competition ? featuredRaw(competition) : null;
}

export async function getCompetitionMetadata() {
  const gameOptions = await listActiveGameOptions();
  return {
    journey: [
      {
        id: "discover",
        number: 1,
        label: "DISCOVER",
        description: "Find an open competition that matches your game and availability.",
      },
      {
        id: "verify",
        number: 2,
        label: "VERIFY",
        description: "Review eligibility, schedule, rules, rewards and capacity.",
      },
      {
        id: "enter",
        number: 3,
        label: "ENTER",
        description: "Confirm once. Your registration persists across devices and refreshes.",
      },
    ],
    guide_links: [
      { id: "rules", label: "COMPETITION RULES" },
      { id: "support", label: "PLAYER SUPPORT" },
    ],
    filter_options: {
      tabs: [
        { value: "all", label: "ALL" },
        { value: "live", label: "LIVE" },
        { value: "upcoming", label: "UPCOMING" },
        { value: "entered", label: "ENTERED" },
        { value: "popular", label: "POPULAR" },
      ],
      games: [
        { value: "all", label: "ALL GAMES" },
        ...gameOptions.map((game) => ({ value: game.filter_value, label: game.name })),
      ],
      team_sizes: [
        { value: "all", label: "ALL TEAM SIZES" },
        { value: "1V1", label: "1V1" },
        { value: "4V4", label: "4V4" },
        { value: "5V5", label: "5V5" },
      ],
      entry_fees: [
        { value: "all", label: "ALL ENTRY FEES" },
        { value: "free", label: "FREE" },
        { value: "paid", label: "PAID" },
      ],
      sorts: [
        { value: "starts-soon", label: "STARTS SOON" },
        { value: "popular", label: "POPULAR" },
        { value: "prize-high", label: "PRIZE HIGH" },
        { value: "availability", label: "MOST AVAILABLE" },
      ],
    },
  };
}

export async function getCurrentCompetitionEntry(userId: string) {
  const entry = await findLatestCompetitionEntry(userId);
  if (!entry) return null;
  return {
    entry_id: entry.id,
    competition_name: entry.competition_name,
    state_label: "CONFIRMED",
    team_label: entry.team_size === "1V1" ? "SOLO ENTRY" : "TEAM ENTRY",
    status_label: "STATUS: REGISTERED",
  };
}

async function requireCompetition(userId: string, competitionId: string) {
  const competition = await findCompetitionById(userId, competitionId);
  if (!competition) {
    throw new CompetitionServiceError(404, "not_found", "Competition not found.");
  }
  return competition;
}

export async function getCompetitionDetailResource(
  userId: string,
  competitionId: string,
  resource:
    "summary" | "eligibility" | "schedule" | "rewards" | "rules" | "participants" | "bracket",
) {
  const competition = await requireCompetition(userId, competitionId);

  if (resource === "summary") {
    return {
      competition_id: competition.id,
      eyebrow: competition.eyebrow,
      name: competition.name,
      description: competition.description,
      status_label: lifecycleLabel(competition.lifecycle),
      season_label: competition.season_label,
      week_label: competition.week_label,
      game_label: competition.game_name,
      format_label: competition.format_label,
      region_label: competition.region_label,
      team_size_label: competition.team_size,
      capacity_label: `${competition.registered_count} / ${competition.capacity} ENTRIES`,
      entry_fee_label: entryFeeLabel(competition),
      prize_pool_label: prizeLabel(competition),
      reward_note: competition.reward_note,
      countdown_label: timingLabel(competition),
      art_key: competition.art_key,
      tags: asStringArray(competition.tags),
    };
  }

  if (resource === "eligibility") {
    const result = await eligibility(competition, userId);
    return {
      state: result.state,
      label: result.label,
      summary: result.summary,
      checks: result.checks,
    };
  }

  if (resource === "schedule") {
    const now = Date.now();
    const stages = [
      ["registration", "REGISTRATION CLOSES", competition.registration_closes_at],
      ["check-in", "CHECK-IN OPENS", competition.check_in_opens_at],
      ["start", "COMPETITION STARTS", competition.starts_at],
      ["end", "COMPETITION ENDS", competition.ends_at],
    ] as const;
    return {
      timezone_label: "WEST AFRICA TIME (WAT)",
      stages: stages.flatMap(([id, label, value]) =>
        value
          ? [
              {
                id,
                label,
                date_label: dateLabel(value),
                time_label: timeLabel(value),
                status: value.getTime() < now ? ("complete" as const) : ("upcoming" as const),
              },
            ]
          : [],
      ),
    };
  }

  if (resource === "rewards") {
    return {
      prize_pool_label: prizeLabel(competition),
      reward_note: competition.reward_note,
      breakdown: asRewardBreakdown(competition.reward_breakdown),
    };
  }

  if (resource === "rules") {
    return {
      updated_label: `UPDATED ${dateLabel(competition.updated_at)}`,
      sections: asRuleSections(competition.rules_sections),
    };
  }

  if (resource === "participants") {
    const participants = await listCompetitionParticipants(competition.id);
    return {
      total_label: `${participants.length} / ${competition.capacity} ENTRIES`,
      confirmed_label: `${participants.length} CONFIRMED`,
      participants: participants.map((participant, index) => {
        const label = participant.display_name || participant.gamer_tag;
        return {
          participant_id: participant.user_id,
          seed: index + 1,
          name: label,
          tag: participant.handle || `@${participant.gamer_tag}`,
          status_label: "CONFIRMED",
          avatar_initials: label
            .split(/\s+/)
            .map((part) => part[0] ?? "")
            .join("")
            .slice(0, 2)
            .toLocaleUpperCase("en"),
        };
      }),
    };
  }

  return {
    status_label:
      competition.lifecycle === "in_progress" || competition.lifecycle === "completed"
        ? "BRACKET PENDING OPERATIONS DATA"
        : "BRACKET PUBLISHES AFTER SEEDING",
    rounds: [],
  };
}

export async function getCompetitionEntryControl(userId: string, competitionId: string) {
  const competition = await requireCompetition(userId, competitionId);
  const [eligibilityResult, existingEntry] = await Promise.all([
    eligibility(competition, userId),
    findCompetitionEntry(userId, competitionId),
  ]);
  const full = competition.registered_count >= competition.capacity;
  const canEnter =
    competition.lifecycle === "registration_open" &&
    eligibilityResult.state === "eligible" &&
    !full &&
    !existingEntry;

  return {
    competition_id: competition.id,
    competition_name: competition.name,
    lifecycle_state: entryLifecycle(competition.lifecycle),
    lifecycle_label: lifecycleLabel(competition.lifecycle),
    state_version: stateVersion(competition),
    can_enter: canEnter,
    eligibility_state: eligibilityResult.state,
    eligibility_label: eligibilityResult.label,
    eligibility_summary: full
      ? "This competition has reached capacity."
      : existingEntry
        ? "Your confirmed entry is available to manage."
        : eligibilityResult.summary,
    entrant_label: eligibilityResult.viewer.display_name || eligibilityResult.viewer.gamer_tag,
    team_label: competition.team_size === "1V1" ? "SOLO ENTRY" : "TEAM ENTRY",
    game_label: competition.game_name,
    format_label: competition.format_label,
    entry_fee_label: entryFeeLabel(competition),
    roster_lock_label: "ROSTER LOCKS WHEN CHECK-IN OPENS",
    check_in_label: competition.check_in_opens_at
      ? `CHECK-IN: ${dateLabel(competition.check_in_opens_at)} · ${timeLabel(competition.check_in_opens_at)} WAT`
      : "CHECK-IN SCHEDULE PENDING",
    existing_entry: existingEntry ? entryRaw(existingEntry) : null,
  };
}

function registrationCode(competitionId: string): string {
  const prefix = competitionId
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toLocaleUpperCase("en") ?? "X")
    .join("");
  return `VZ-${prefix}-${randomUUID().replaceAll("-", "").slice(0, 6).toLocaleUpperCase("en")}`;
}

export async function confirmCompetitionEntry(input: {
  userId: string;
  competitionId: string;
  payload: unknown;
  idempotencyHeader: string | null;
  requestId: string;
}) {
  const parsed = competitionEntryCommandRawSchema.safeParse(input.payload);
  if (!parsed.success) {
    throw new CompetitionServiceError(400, "invalid_request", "Review the entry confirmation.", {
      fieldErrors: {
        entry: ["Competition, version, idempotency key and accepted terms are required."],
      },
    });
  }
  if (parsed.data.competition_id !== input.competitionId) {
    throw new CompetitionServiceError(400, "competition_mismatch", "Competition ID mismatch.");
  }
  if (!input.idempotencyHeader || input.idempotencyHeader !== parsed.data.idempotency_key) {
    throw new CompetitionServiceError(
      400,
      "idempotency_mismatch",
      "The Idempotency-Key header must match the command.",
    );
  }

  const competition = await requireCompetition(input.userId, input.competitionId);
  const eligibilityResult = await eligibility(competition, input.userId);
  if (eligibilityResult.state !== "eligible") {
    throw new CompetitionServiceError(422, "not_eligible", eligibilityResult.summary);
  }

  const expectedVersion = parseStateVersion(parsed.data.expected_state_version);
  if (!expectedVersion) {
    throw new CompetitionServiceError(
      409,
      "stale_state",
      "Refresh the competition before entering.",
      {
        retryable: true,
      },
    );
  }

  const result = await createCompetitionEntry({
    userId: input.userId,
    competitionId: input.competitionId,
    expectedVersion,
    idempotencyKey: parsed.data.idempotency_key,
    registrationCode: registrationCode(input.competitionId),
    requestId: input.requestId,
  });

  if (result.outcome === "not_found") {
    throw new CompetitionServiceError(404, "not_found", "Competition not found.");
  }
  if (result.outcome === "stale") {
    throw new CompetitionServiceError(
      409,
      "stale_state",
      "Competition state changed. Refresh and retry.",
      {
        retryable: true,
      },
    );
  }
  if (result.outcome === "closed") {
    throw new CompetitionServiceError(409, "registration_closed", "Registration is not open.");
  }
  if (result.outcome === "full") {
    throw new CompetitionServiceError(
      409,
      "full_capacity",
      "Competition capacity has been reached.",
    );
  }
  if (!result.entry) {
    throw new CompetitionServiceError(503, "entry_unavailable", "Entry could not be confirmed.", {
      retryable: true,
    });
  }

  return {
    status: result.outcome === "created" ? 201 : 200,
    data: {
      entry: entryRaw(result.entry),
      duplicate: result.outcome === "duplicate",
      already_entered: result.outcome === "already_entered",
    },
  };
}

export async function getCompetitionLifecycle(userId: string, competitionId: string) {
  const competition = await findCompetitionById(userId, competitionId);
  if (!competition) {
    return resolveCompetitionLifecycle({
      competitionId,
      exists: false,
      lifecycle: "scheduled",
      eligibility: "not_eligible",
      authorization: "authorized",
      system: "available",
      registeredCount: 0,
      capacity: 1,
      waitlistEnabled: false,
      partialFailure: false,
    });
  }
  const eligibilityResult = await eligibility(competition, userId);
  return resolveCompetitionLifecycle({
    competitionId,
    exists: true,
    lifecycle: competition.lifecycle as CompetitionLifecycleState,
    eligibility: eligibilityResult.state === "eligible" ? "eligible" : "not_eligible",
    authorization: "authorized",
    system: "available",
    registeredCount: competition.registered_count,
    capacity: competition.capacity,
    waitlistEnabled: competition.waitlist_enabled,
    partialFailure: false,
  });
}

export async function getRecommendedCompetitions(userId: string) {
  const result = await listCompetitionDiscovery(userId, {
    search: "",
    tab: "all",
    game: "all" as CompetitionDiscoveryGame,
    teamSize: "all",
    entryFee: "all",
    sort: "starts-soon",
    page: 1,
    pageSize: 4,
  });
  return Promise.all(
    result.items
      .filter((competition) => competition.lifecycle === "registration_open")
      .map(async (competition) => {
        const eligibilityResult = await eligibility(competition, userId);
        return {
          competition_id: competition.id,
          title: competition.name,
          game: competition.game_name,
          format: competition.format_label,
          starts_at: competition.starts_at.toISOString(),
          registration_closes_at:
            competition.registration_closes_at?.toISOString() ??
            competition.starts_at.toISOString(),
          entry_label: entryFeeLabel(competition),
          eligibility_label: eligibilityResult.label,
          reward_label: prizeLabel(competition),
          is_featured: competition.is_featured,
        };
      }),
  );
}

export function competitionResourceMeta(lastUpdatedAt = new Date()) {
  const now = new Date().toISOString();
  return {
    server_now: now,
    last_updated_at: lastUpdatedAt.toISOString(),
    freshness: "fresh" as const,
  };
}

export function competitionArtKey(value: string): CompetitionArtKey {
  return ["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"].includes(
    value,
  )
    ? (value as CompetitionArtKey)
    : "championship";
}
