"use client";

// VERZUS M9.4 RESOURCE-AWARE CREW PROFILE SCREEN
// VERZUS M9.5 MEMBERSHIP-AWARE RESOURCE COMPOSITION

import { getCrewFoundationMock } from "../../foundation";
import { CrewMembershipScreen } from "../../membership";
import { useCrewResources } from "../hooks/useCrewResources";
import { mergeCrewResourceSnapshot } from "../model/crew-resource.merge";
import type { CrewResourceName, CrewResourceScenario } from "../model/crew-resource.types";
import styles from "./CrewResourceScreen.module.css";
import { CrewResourceStatusStrip } from "./CrewResourceStatusStrip";

export function CrewResourceScreen({
  crewId,
  targetResource,
  scenario = "normal",
}: {
  crewId: string;
  targetResource?: CrewResourceName | undefined;
  scenario?: CrewResourceScenario;
}) {
  const resources = useCrewResources(crewId, targetResource, scenario);
  const model = mergeCrewResourceSnapshot(getCrewFoundationMock(crewId), resources.snapshots);

  return (
    <div className={styles.resourceScreen} data-m9-stage="9.5">
      <CrewResourceStatusStrip
        health={resources.health}
        onRetry={(resource) => void resources.retry(resource)}
      />
      <CrewMembershipScreen crewId={crewId} model={model} />
    </div>
  );
}
