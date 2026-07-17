// VERZUS M8.9 PLAYER INTEL MOCK SERVICE

import type { PlayerIntelViewModel } from "../player-intel.types";
import type { PlayerIntelResourceScenario } from "./player-intel-resource.schema";

const knownPlayers: Record<string, Partial<PlayerIntelViewModel>> = {
  "player-prismo": {
    displayName: "Prismo",
    handle: "@prismo",
    crewName: "Xenon",
    rank: 1,
    trust: 97,
    wins: 128,
    winRateLabel: "78%",
    pointsLabel: "26,750",
    streakLabel: "7W",
  },
  "player-rival-king": {
    displayName: "RivalKing",
    handle: "@rivalking",
    crewName: "Nova",
    rank: 2,
    trust: 95,
    wins: 115,
    winRateLabel: "72%",
    pointsLabel: "24,330",
    streakLabel: "2W",
  },
  "player-ghosty": {
    displayName: "Ghosty",
    handle: "@ghosty",
    crewName: "Xenon",
    rank: 3,
    trust: 93,
    wins: 109,
    winRateLabel: "69%",
    pointsLabel: "22,810",
    streakLabel: "5W",
  },
  "player-current": {
    displayName: "You",
    handle: "@prismo-player",
    crewName: "Xenon",
    rank: 23,
    trust: 96,
    wins: 47,
    winRateLabel: "67%",
    pointsLabel: "9,840",
    streakLabel: "4W",
  },
};

function titleFromId(id: string): string {
  return id
    .replace(/^player-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createPlayerIntelModel(playerId: string): PlayerIntelViewModel {
  const known = knownPlayers[playerId] ?? {};
  const name = known.displayName ?? (titleFromId(playerId) || "VERZUS Player");
  return {
    id: playerId,
    displayName: name,
    handle: known.handle ?? `@${playerId.replace(/^player-/, "")}`,
    subtitle: "Verified competitive player",
    locationLabel: "Lagos, Nigeria",
    gameLabel: "EA FC",
    crewName: known.crewName ?? "Independent",
    avatarSrc: "/intel-cards/jayflex.svg",
    rank: known.rank ?? 48,
    trust: known.trust ?? 91,
    verified: true,
    wins: known.wins ?? 64,
    winRateLabel: known.winRateLabel ?? "64%",
    pointsLabel: known.pointsLabel ?? "12,480",
    streakLabel: known.streakLabel ?? "3W",
    recentForm: ["W", "W", "L", "W", "D"],
    recentMatches: [
      {
        id: `match-${playerId}-01`,
        opponentLabel: "Apex Predators",
        result: "W",
        scoreLabel: "3-1",
        href: `/matches/match-${playerId}-01`,
      },
      {
        id: `match-${playerId}-02`,
        opponentLabel: "Rebels United",
        result: "L",
        scoreLabel: "1-2",
        href: `/matches/match-${playerId}-02`,
      },
    ],
    achievementPreview: ["Top 10 finish", "7-match streak", "Verified result record"],
    profileHref: `/players/${encodeURIComponent(playerId)}`,
    challengeHref: null,
  };
}

export function serializePlayerIntelModel(model: PlayerIntelViewModel) {
  return {
    id: model.id,
    display_name: model.displayName,
    handle: model.handle,
    subtitle: model.subtitle,
    location_label: model.locationLabel,
    game_label: model.gameLabel,
    crew_name: model.crewName,
    avatar_src: model.avatarSrc,
    rank: model.rank,
    trust: model.trust,
    verified: model.verified,
    wins: model.wins,
    win_rate_label: model.winRateLabel,
    points_label: model.pointsLabel,
    streak_label: model.streakLabel,
    recent_form: model.recentForm,
    recent_matches: (model.recentMatches ?? []).map((item) => ({
      id: item.id,
      opponent_label: item.opponentLabel,
      result: item.result,
      score_label: item.scoreLabel,
      href: item.href,
    })),
    achievement_preview: model.achievementPreview ?? [],
    profile_href: model.profileHref,
    challenge_href: model.challengeHref,
  };
}

export function normalizePlayerIntelScenario(value: string | null): PlayerIntelResourceScenario {
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
