import {
  CrewDiscoveryScreen,
  type CrewDiscoveryQuery,
  type CrewDiscoveryRecord,
  type CrewMembershipState,
  type CrewRootView,
} from "../discovery";
import { CrewSurfaceTelemetry } from "../telemetry";
import { CrewResourceScreen } from "../resources";

export type CrewsScreenProps = {
  crewId?: string;
  view?: CrewRootView;
  membership?: CrewMembershipState;
  discoveryQuery?: CrewDiscoveryQuery;
  crews?: readonly CrewDiscoveryRecord[];
};

export function CrewsScreen({
  crewId,
  view = "profile",
  membership = "none",
  discoveryQuery,
  crews = [],
}: CrewsScreenProps) {
  if (view === "discover" || membership === "none" || !crewId) {
    if (!discoveryQuery) {
      return null;
    }

    return (
      <>
        <CrewSurfaceTelemetry
          surface={membership === "none" && view !== "discover" ? "no_crew" : "discovery"}
        />
        <CrewDiscoveryScreen
          crews={crews}
          initialQuery={discoveryQuery}
          key={JSON.stringify(discoveryQuery)}
          membership={membership}
          showNoCrewLanding={membership === "none" && view !== "discover"}
        />
      </>
    );
  }

  return <CrewResourceScreen crewId={crewId} />;
}
