export type PlayerFormResult = "W" | "D" | "L";

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
  profileHref: string;
  challengeHref: string | null;
};
