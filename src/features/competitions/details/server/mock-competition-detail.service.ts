import type { CompetitionDetailScenario } from "../model/competition-detail.types";
import { competitionDetailMockById } from "../mocks/competition-detail.mock";

export type CompetitionDetailResourceName =
  "summary" | "eligibility" | "schedule" | "rewards" | "rules" | "participants" | "bracket";

function requestId(resource: string) {
  return `mock-competition-detail-${resource}-${globalThis.crypto.randomUUID()}`;
}

function failure(status: number, code: string, message: string, retryable = true) {
  return {
    status,
    body: {
      ok: false as const,
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

function raw(resource: CompetitionDetailResourceName, value: unknown) {
  if (resource === "summary") {
    const item = value as (typeof competitionDetailMockById)[string]["summary"];
    return {
      competition_id: item.id,
      eyebrow: item.eyebrow,
      name: item.name,
      description: item.description,
      status_label: item.statusLabel,
      season_label: item.seasonLabel,
      week_label: item.weekLabel,
      game_label: item.gameLabel,
      format_label: item.formatLabel,
      region_label: item.regionLabel,
      team_size_label: item.teamSizeLabel,
      capacity_label: item.capacityLabel,
      entry_fee_label: item.entryFeeLabel,
      prize_pool_label: item.prizePoolLabel,
      reward_note: item.rewardNote,
      countdown_label: item.countdownLabel,
      art_key: item.artKey,
      tags: item.tags,
    };
  }
  if (resource === "schedule") {
    const item = value as (typeof competitionDetailMockById)[string]["schedule"];
    return {
      timezone_label: item.timezoneLabel,
      stages: item.stages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        date_label: stage.dateLabel,
        time_label: stage.timeLabel,
        status: stage.status,
      })),
    };
  }
  if (resource === "rewards") {
    const item = value as (typeof competitionDetailMockById)[string]["rewards"];
    return {
      prize_pool_label: item.prizePoolLabel,
      reward_note: item.rewardNote,
      breakdown: item.breakdown.map((entry) => ({
        id: entry.id,
        label: entry.label,
        value_label: entry.valueLabel,
      })),
    };
  }
  if (resource === "rules") {
    const item = value as (typeof competitionDetailMockById)[string]["rules"];
    return { updated_label: item.updatedLabel, sections: item.sections };
  }
  if (resource === "participants") {
    const item = value as (typeof competitionDetailMockById)[string]["participants"];
    return {
      total_label: item.totalLabel,
      confirmed_label: item.confirmedLabel,
      participants: item.participants.map((participant) => ({
        participant_id: participant.id,
        seed: participant.seed,
        name: participant.name,
        tag: participant.tag,
        status_label: participant.statusLabel,
        avatar_initials: participant.avatarInitials,
      })),
    };
  }
  if (resource === "bracket") {
    const item = value as (typeof competitionDetailMockById)[string]["bracket"];
    return {
      status_label: item.statusLabel,
      rounds: item.rounds.map((round) => ({
        id: round.id,
        label: round.label,
        matches: round.matches.map((match) => ({
          id: match.id,
          left_label: match.leftLabel,
          right_label: match.rightLabel,
          score_label: match.scoreLabel,
          state: match.state,
        })),
      })),
    };
  }
  return value;
}

export function getMockCompetitionDetailResource(
  competitionId: string,
  resource: CompetitionDetailResourceName,
  scenario: CompetitionDetailScenario,
) {
  const detail = competitionDetailMockById[competitionId];
  if (!detail || scenario === "not_found") {
    return failure(404, "not_found", "Competition not found.", false);
  }
  if (scenario === "offline") return failure(503, "offline", "Competition details are offline.");
  if (scenario === "maintenance")
    return failure(503, "maintenance", "Competition details are under maintenance.");
  if (scenario === "partial_failure" && resource === "bracket") {
    return failure(503, "upstream_unavailable", "Bracket service is temporarily unavailable.");
  }
  if (scenario === "malformed" && resource === "participants") {
    return { status: 200, body: { ok: true, data: { broken: true } } };
  }

  const now = new Date().toISOString();
  return {
    status: 200,
    body: {
      ok: true as const,
      data: raw(resource, detail[resource]),
      request_id: requestId(resource),
      meta: {
        server_now: now,
        last_updated_at: now,
        freshness: scenario === "stale" ? ("stale" as const) : ("fresh" as const),
      },
    },
  };
}
