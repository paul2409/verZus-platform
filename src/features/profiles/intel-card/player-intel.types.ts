export type PlayerFormResult = "W" | "D" | "L";

export type PlayerRecentMatchIntel = {
  id: string;
  opponentLabel: string;
  result: PlayerFormResult;
  scoreLabel: string;
  href: string;
};

export type PlayerIntelViewModel = {
  id: string;
  displayName: string;
  handle: string;
  subtitle: string;
  locationLabel: string;
  gameLabel: string;
  crewName: string;
  avatarSrc: string;
  rank: number;
  trust: number;
  verified: boolean;
  wins: number;
  winRateLabel: string;
  pointsLabel: string;
  streakLabel: string;
  recentForm: readonly PlayerFormResult[];
  recentMatches?: readonly PlayerRecentMatchIntel[];
  achievementPreview?: readonly string[];
  profileHref: string;
  challengeHref: string | null;
};
