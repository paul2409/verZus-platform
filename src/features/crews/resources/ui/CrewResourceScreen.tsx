"use client";

// VERZUS M9.4 RESOURCE-AWARE CREW PROFILE SCREEN
// VERZUS M9.5 MEMBERSHIP-AWARE RESOURCE COMPOSITION
// VERZUS M9.6 GOVERNANCE-AWARE RESOURCE COMPOSITION
// VERZUS M9.7 LIFECYCLE AND ACTIVITY RELIABILITY COMPOSITION
// VERZUS M9.8 RELEASE TELEMETRY COMPOSITION

import { getCrewFoundationMock } from "../../foundation";
import type { CrewLifecycleScenario } from "../../lifecycle";
import { CrewMembershipScreen } from "../../membership";
import { CrewResourceFailureTelemetry, CrewSurfaceTelemetry } from "../../telemetry";
import { useCrewResources } from "../hooks/useCrewResources";
import { mergeCrewResourceSnapshot } from "../model/crew-resource.merge";
import type { CrewResourceName, CrewResourceScenario } from "../model/crew-resource.types";
import styles from "./CrewResourceScreen.module.css";
import { CrewResourceStatusStrip } from "./CrewResourceStatusStrip";

export function CrewResourceScreen({
  crewId,
  targetResource,
  scenario = "normal",
  lifecycleScenario = "normal",
}: {
  crewId: string;
  targetResource?: CrewResourceName | undefined;
  scenario?: CrewResourceScenario;
  lifecycleScenario?: CrewLifecycleScenario;
}) {
  const resources = useCrewResources(crewId, targetResource, scenario);
  const model = mergeCrewResourceSnapshot(getCrewFoundationMock(crewId), resources.snapshots);

  return (
    <div className={styles.resourceScreen} data-m9-stage="9.8">
      <CrewSurfaceTelemetry crewId={crewId} surface="profile" />
      <CrewResourceFailureTelemetry crewId={crewId} health={resources.health} />
      <CrewResourceStatusStrip
        health={resources.health}
        onRetry={(resource) => void resources.retry(resource)}
      />
      <CrewMembershipScreen
        activityHealth={resources.health.activity}
        crewId={crewId}
        lifecycleScenario={lifecycleScenario}
        model={model}
        onRetryActivity={() => void resources.retry("activity")}
      />
    </div>
  );
}
