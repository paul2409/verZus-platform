// VERZUS M9.8 CREW FEATURE GATE

import Link from "next/link";
import type { ReactNode } from "react";

import { getCrewReleaseConfig } from "./crew-release.config";
import styles from "./CrewFeatureGate.module.css";

export function CrewFeatureGate({ children }: { children: ReactNode }) {
  const config = getCrewReleaseConfig();

  if (config.crewsEnabled) return children;

  return (
    <main className={styles.disabled} data-m9-feature-state="disabled">
      <span>CREW SYSTEM TEMPORARILY DISABLED</span>
      <h1>Crew operations are unavailable</h1>
      <p>
        Play, competitions, matches, leaderboards and primary navigation remain available while the
        Crew domain is isolated.
      </p>
      <Link href="/play">Return to Play</Link>
      <small>
        Environment {config.appEnvironment} · Release {config.releaseSha}
      </small>
    </main>
  );
}
