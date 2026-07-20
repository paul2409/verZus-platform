// VERZUS M11.8 PROFILE FEATURE GATE

import Link from "next/link";
import type { ReactNode } from "react";

import { getProfileReleaseConfig } from "./profile-release.config";
import styles from "./ProfileFeatureGate.module.css";

export function ProfileFeatureGate({ children }: { children: ReactNode }) {
  const config = getProfileReleaseConfig();

  if (config.profilesEnabled) return children;

  return (
    <main className={styles.disabled} data-m11-feature-state="disabled">
      <span>PLAYER PROFILES TEMPORARILY DISABLED</span>
      <h1>Player identity is unavailable</h1>
      <p>
        Play, competitions, matches, leaderboards, Crews, Rewards and primary navigation remain
        available while the Profile domain is isolated.
      </p>
      <div className={styles.actions}>
        <Link href="/play">Return to Play</Link>
        <Link href="/leaderboards/weekly">View leaderboards</Link>
      </div>
      <small>
        Environment {config.appEnvironment} · Release {config.releaseSha}
      </small>
    </main>
  );
}
