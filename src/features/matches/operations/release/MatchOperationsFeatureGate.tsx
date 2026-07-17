// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

import { Suspense, type ReactNode } from "react";

import { MatchTelemetryBridge } from "../telemetry";
import { getMatchOperationsReleaseMetadata } from "./match-release.config";
import styles from "./MatchOperationsFeatureGate.module.css";

export type MatchOperationsFeatureGateProps = {
  children: ReactNode;
};

export function MatchOperationsFeatureGate({ children }: MatchOperationsFeatureGateProps) {
  const release = getMatchOperationsReleaseMetadata();

  if (!release.enabled) {
    return (
      <main
        className={styles.disabled}
        data-m7-release="7.8"
        data-release={release.release}
        role="main"
      >
        <section aria-labelledby="match-operations-disabled-title" role="status">
          <span>MATCH OPERATIONS · CONTROLLED DEGRADATION</span>
          <h1 id="match-operations-disabled-title">MATCH OPERATIONS TEMPORARILY PAUSED</h1>
          <p>
            Check-in and match operations are disabled for this release. The application shell,
            competition discovery and primary navigation remain available.
          </p>
          <a href="/play">RETURN TO PLAY</a>
        </section>
      </main>
    );
  }

  return (
    <div
      data-app-environment={release.environment}
      data-m7-release="7.8"
      data-release={release.release}
    >
      <Suspense fallback={null}>
        <MatchTelemetryBridge environment={release.environment} release={release.release} />
      </Suspense>
      {children}
    </div>
  );
}
