import type { PlayerIntelViewModel } from "../player-intel.types";

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
