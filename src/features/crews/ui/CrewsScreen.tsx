// VERZUS M9.1 CREWS ROUTE WRAPPER
// VERZUS M9.2 MEMBERSHIP-AWARE CREW ROUTING
// VERZUS M9.4 INDEPENDENT CREW RESOURCE ROUTING

import {
  CrewDiscoveryScreen,
  crewDiscoveryMock,
  type CrewDiscoveryQuery,
  type CrewMembershipState,
  type CrewRootView,
} from "../discovery";
import { CrewResourceScreen, type CrewResourceName, type CrewResourceScenario } from "../resources";

export type CrewsScreenProps = {
  crewId?: string;
  view?: CrewRootView;
  membership?: CrewMembershipState;
  discoveryQuery?: CrewDiscoveryQuery;
  resource?: CrewResourceName | undefined;
  scenario?: CrewResourceScenario;
};

export function CrewsScreen({
  crewId = "crew-xenon-esports",
  view = "profile",
  membership = "current",
  discoveryQuery,
  resource,
  scenario = "normal",
}: CrewsScreenProps) {
  if (view === "discover" || membership === "none") {
    if (!discoveryQuery) {
      throw new Error("Crew discovery query is required for discovery and no-Crew views.");
    }

    return (
      <CrewDiscoveryScreen
        crews={crewDiscoveryMock}
        initialQuery={discoveryQuery}
        key={JSON.stringify(discoveryQuery)}
        membership={membership}
        showNoCrewLanding={membership === "none" && view !== "discover"}
      />
    );
  }

  return <CrewResourceScreen crewId={crewId} scenario={scenario} targetResource={resource} />;
}
