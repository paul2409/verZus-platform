// VERZUS M9.1 CREW FOUNDATION ROOT ROUTE
// VERZUS M9.2 DISCOVERY URL STATE ROUTE
// VERZUS M9.4 CREW RESOURCE SCENARIO ROUTE

import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import {
  CrewsScreen,
  parseCrewDiscoveryQuery,
  parseCrewResourceName,
  parseCrewResourceScenario,
  type CrewMembershipState,
  type CrewRootView,
} from "@/features/crews";

const route = getPlatformRouteById("crews");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default async function CrewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const view: CrewRootView = query.view === "discover" ? "discover" : "profile";
  const membership: CrewMembershipState = query.membership === "none" ? "none" : "current";

  return (
    <CrewsScreen
      discoveryQuery={parseCrewDiscoveryQuery(query)}
      membership={membership}
      resource={parseCrewResourceName(query.resource)}
      scenario={parseCrewResourceScenario(query.scenario)}
      view={view}
    />
  );
}
