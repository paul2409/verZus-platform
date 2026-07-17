// VERZUS M8.7 QUALITY AND FAILURE-INJECTION TYPES

export const leaderboardCrashTargets = [
  "status",
  "ranking",
  "current-position",
  "rewards",
] as const;

export type LeaderboardCrashTarget = (typeof leaderboardCrashTargets)[number];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseLeaderboardCrashTarget(
  value: string | string[] | undefined,
): LeaderboardCrashTarget | null {
  const candidate = firstValue(value);
  return leaderboardCrashTargets.includes(candidate as LeaderboardCrashTarget)
    ? (candidate as LeaderboardCrashTarget)
    : null;
}
