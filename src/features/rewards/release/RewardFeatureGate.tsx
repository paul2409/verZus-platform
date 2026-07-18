// VERZUS M10.8 REWARD FEATURE GATE

import Link from "next/link";
import type { ReactNode } from "react";

import { getRewardReleaseConfig } from "./reward-release.config";
import styles from "./RewardFeatureGate.module.css";

export function RewardFeatureGate({ children }: { children: ReactNode }) {
  const config = getRewardReleaseConfig();

  if (config.rewardsEnabled) return children;

  return (
    <main className={styles.disabled} data-m10-feature-state="disabled">
      <span>REWARDS TEMPORARILY DISABLED</span>
      <h1>Rewards and progression are unavailable</h1>
      <p>
        Play, competitions, matches, leaderboards, Crews and primary navigation remain available
        while the Rewards domain is isolated.
      </p>
      <Link href="/play">Return to Play</Link>
      <small>
        Environment {config.appEnvironment} · Release {config.releaseSha}
      </small>
    </main>
  );
}
