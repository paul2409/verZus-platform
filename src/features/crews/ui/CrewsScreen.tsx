// VERZUS M9.1 CREWS ROUTE WRAPPER
// VERZUS M9.2 MEMBERSHIP-AWARE CREW ROUTING
// VERZUS M9.4 INDEPENDENT CREW RESOURCE ROUTING
// VERZUS M9.7 LIFECYCLE SCENARIO ROUTING
// VERZUS M9.8 RELEASE TELEMETRY ROUTING

import {
  CrewDiscoveryScreen,
  crewDiscoveryMock,
  type CrewDiscoveryQuery,
  type CrewMembershipState,
  type CrewRootView,
} from "../discovery";
import type { CrewLifecycleScenario } from "../lifecycle";
import { CrewSurfaceTelemetry } from "../telemetry";
import { CrewResourceScreen, type CrewResourceName, type CrewResourceScenario } from "../resources";

export type CrewsScreenProps = {
  crewId?: string;
  view?: CrewRootView;
  membership?: CrewMembershipState;
  discoveryQuery?: CrewDiscoveryQuery;
  resource?: CrewResourceName | undefined;
  scenario?: CrewResourceScenario;
  lifecycleScenario?: CrewLifecycleScenario;
};

export function CrewsScreen({
  crewId = "crew-xenon-esports",
  view = "profile",
  membership = "current",
  discoveryQuery,
  resource,
  scenario = "normal",
  lifecycleScenario = "normal",
}: CrewsScreenProps) {
  if (view === "discover" || membership === "none") {
    if (!discoveryQuery) {
      throw new Error("Crew discovery query is required for discovery and no-Crew views.");
    }

    return (
      <>
        <CrewSurfaceTelemetry
          surface={membership === "none" && view !== "discover" ? "no_crew" : "discovery"}
        />
        <CrewDiscoveryScreen
          crews={crewDiscoveryMock}
          initialQuery={discoveryQuery}
          key={JSON.stringify(discoveryQuery)}
          membership={membership}
          showNoCrewLanding={membership === "none" && view !== "discover"}
        />
      </>
    );
  }

  return (
    <CrewResourceScreen
      crewId={crewId}
      lifecycleScenario={lifecycleScenario}
      scenario={scenario}
      targetResource={resource}
    />
  );
}
