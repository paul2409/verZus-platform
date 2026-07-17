// VERZUS M8.10 LEADERBOARD RELEASE LAYOUT

import type { ReactNode } from "react";

import { LeaderboardFeatureGate } from "@/features/leaderboards/release";

export default function LeaderboardsLayout({ children }: { children: ReactNode }) {
  return <LeaderboardFeatureGate>{children}</LeaderboardFeatureGate>;
}
