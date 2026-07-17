// VERZUS M8.10 LEADERBOARD FEATURE GATE

import Link from "next/link";
import type { ReactNode } from "react";

import { getLeaderboardReleaseConfig } from "./leaderboard-release.config";
import styles from "./LeaderboardFeatureGate.module.css";

export function LeaderboardFeatureGate({ children }: { children: ReactNode }) {
  const config = getLeaderboardReleaseConfig();

  if (config.leaderboardsEnabled) return children;

  return (
    <main className={styles.disabled} data-m8-feature-state="disabled">
      <span>LEADERBOARDS TEMPORARILY DISABLED</span>
      <h1>Rankings are unavailable</h1>
      <p>
        Match Operations, competitions and the primary navigation remain available while this
        feature is isolated.
      </p>
      <Link href="/play">Return to Play</Link>
      <small>
        Environment {config.appEnvironment} · Release {config.releaseSha}
      </small>
    </main>
  );
}
