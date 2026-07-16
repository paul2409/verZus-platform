// VERZUS M6.7 COMPETITION RELEASE GATE

import { Suspense, type ReactNode } from "react";

import { CompetitionTelemetryBridge } from "../telemetry";
import { getCompetitionReleaseMetadata } from "./competition-release.config";
import styles from "./CompetitionFeatureGate.module.css";

export type CompetitionFeatureGateProps = {
  children: ReactNode;
};

export function CompetitionFeatureGate({ children }: CompetitionFeatureGateProps) {
  const release = getCompetitionReleaseMetadata();

  if (!release.enabled) {
    return (
      <main
        className={styles.disabled}
        data-m6-release="6.7"
        data-release={release.release}
        role="main"
      >
        <section aria-labelledby="competition-disabled-title" role="status">
          <span>COMPETITIONS · CONTROLLED DEGRADATION</span>
          <h1 id="competition-disabled-title">COMPETITIONS TEMPORARILY PAUSED</h1>
          <p>
            Competition discovery and entry are disabled for this release. The application shell and
            primary navigation remain available.
          </p>
          <a href="/play">RETURN TO PLAY</a>
        </section>
      </main>
    );
  }

  return (
    <div
      data-app-environment={release.environment}
      data-m6-release="6.7"
      data-release={release.release}
    >
      <Suspense fallback={null}>
        <CompetitionTelemetryBridge environment={release.environment} release={release.release} />
      </Suspense>
      {children}
    </div>
  );
}
