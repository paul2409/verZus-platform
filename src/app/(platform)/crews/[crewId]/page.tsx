// VERZUS M9.1 CREW PROFILE DYNAMIC ROUTE
// VERZUS M9.4 INDEPENDENT CREW RESOURCE ROUTE
// VERZUS M9.7 CREW LIFECYCLE SCENARIO ROUTE

import type { Metadata } from "next";

import {
  CrewsScreen,
  parseCrewLifecycleScenario,
  parseCrewResourceName,
  parseCrewResourceScenario,
} from "@/features/crews";

export const metadata: Metadata = {
  title: "Crew Profile — VERZUS",
  description: "Crew identity, rankings, roster, activity and operations overview.",
};

export default async function CrewProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ crewId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ crewId }, query] = await Promise.all([params, searchParams]);
  return (
    <CrewsScreen
      crewId={crewId}
      lifecycleScenario={parseCrewLifecycleScenario(query.lifecycleScenario)}
      resource={parseCrewResourceName(query.resource)}
      scenario={parseCrewResourceScenario(query.scenario)}
    />
  );
}
