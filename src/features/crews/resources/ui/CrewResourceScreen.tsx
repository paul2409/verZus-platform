"use client";

import { CrewFoundationScreen, type CrewFoundationViewModel } from "../../foundation";
import { CrewResourceFailureTelemetry, CrewSurfaceTelemetry } from "../../telemetry";
import { useCrewResources } from "../hooks/useCrewResources";
import { mergeCrewResourceSnapshot } from "../model/crew-resource.merge";
import styles from "./CrewResourceScreen.module.css";
import { CrewResourceStatusStrip } from "./CrewResourceStatusStrip";

function createBaseModel(
  identity: CrewFoundationViewModel["identity"],
): CrewFoundationViewModel {
  return {
    identity,
    members: [],
    requests: [],
    activity: [],
    stats: {
      rank: 0,
      movement: 0,
      points: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      streak: 0,
      trust: 0,
      activeMembers: 0,
    },
    achievements: [],
    settings: {
      recruiting: false,
      primaryGame: identity.games[0] ?? "Not configured",
      language: "Not configured",
      minimumRank: "Open",
      communityLinkLabel: "Not configured",
    },
  };
}

export function CrewResourceScreen({ crewId }: { crewId: string }) {
  const resources = useCrewResources(crewId);
  const identity = resources.snapshots.profile?.data.identity;

  if (!identity) {
    return (
      <div className={styles.resourceScreen} data-m9-stage="production">
        <CrewSurfaceTelemetry crewId={crewId} surface="profile" />
        <CrewResourceFailureTelemetry crewId={crewId} health={resources.health} />
        <CrewResourceStatusStrip
          health={resources.health}
          onRetry={(resource) => void resources.retry(resource)}
        />
        <p aria-live="polite" role="status">
          {resources.health.profile.state === "error"
            ? "Crew profile is temporarily unavailable."
            : "Loading Crew profile..."}
        </p>
      </div>
    );
  }

  const model = mergeCrewResourceSnapshot(createBaseModel(identity), resources.snapshots);

  return (
    <div className={styles.resourceScreen} data-m9-stage="production">
      <CrewSurfaceTelemetry crewId={crewId} surface="profile" />
      <CrewResourceFailureTelemetry crewId={crewId} health={resources.health} />
      <CrewResourceStatusStrip
        health={resources.health}
        onRetry={(resource) => void resources.retry(resource)}
      />
      <CrewFoundationScreen managementEnabled={false} model={model} />
    </div>
  );
}
