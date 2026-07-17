// VERZUS M8.9 MATCH INTEL MOCK SERVICE

import type { MatchIntelViewModel } from "../match-intel.types";
import type { MatchIntelResourceScenario } from "./match-intel-resource.schema";

function titleFromId(id: string): string {
  return id
    .replace(/^match-/, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createMatchIntelModel(matchId: string): MatchIntelViewModel {
  const subject = titleFromId(matchId) || "Ranked contender";
  return {
    id: matchId,
    weekLabel: "Week 12 result",
    statusLabel: "Result confirmed",
    countdownLabel: "3 - 1",
    startsAtLabel: "Final score",
    gameLabel: "EA FC",
    formatLabel: "BO3 · Weekly ranked · Verified result",
    home: {
      name: subject.toUpperCase(),
      tag: "HOME",
      sideLabel: "Leaderboard subject",
      emblemSrc: "/intel-cards/mainland-titans.svg",
    },
    away: {
      name: "APEX PREDATORS",
      tag: "APX",
      sideLabel: "Opponent",
      emblemSrc: "/intel-cards/lagos-lynx.svg",
    },
    prizePoolLabel: "75 XP",
    stakesLabel: "Rank points",
    checkInClosesLabel: "Closed",
    scoreLabel: "3 - 1",
    competitionLabel: "Weekly ranked",
    roundLabel: "Round 4",
    resultConfirmationLabel: "Both players confirmed",
    disputeLabel: "No dispute",
    matchHref: `/matches/${encodeURIComponent(matchId)}`,
    checkInHref: null,
  };
}

export function serializeMatchIntelModel(model: MatchIntelViewModel) {
  return {
    id: model.id,
    week_label: model.weekLabel,
    status_label: model.statusLabel,
    countdown_label: model.countdownLabel,
    starts_at_label: model.startsAtLabel,
    game_label: model.gameLabel,
    format_label: model.formatLabel,
    home: {
      name: model.home.name,
      tag: model.home.tag,
      side_label: model.home.sideLabel,
      emblem_src: model.home.emblemSrc,
    },
    away: {
      name: model.away.name,
      tag: model.away.tag,
      side_label: model.away.sideLabel,
      emblem_src: model.away.emblemSrc,
    },
    prize_pool_label: model.prizePoolLabel,
    stakes_label: model.stakesLabel,
    check_in_closes_label: model.checkInClosesLabel,
    score_label: model.scoreLabel ?? "Pending",
    competition_label: model.competitionLabel ?? "VERZUS competition",
    round_label: model.roundLabel ?? "Round pending",
    result_confirmation_label: model.resultConfirmationLabel ?? "Pending confirmation",
    dispute_label: model.disputeLabel ?? "No dispute",
    match_href: model.matchHref,
    check_in_href: model.checkInHref,
  };
}

export function normalizeMatchIntelScenario(value: string | null): MatchIntelResourceScenario {
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
