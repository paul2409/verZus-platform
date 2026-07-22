import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { requireAuthenticatedServerSession } from "@/features/auth/server";
import {
  CrewsScreen,
  parseCrewDiscoveryQuery,
  type CrewRootView,
} from "@/features/crews";
import { getCrewRootState } from "@/features/crews/server";

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
  const [query, session] = await Promise.all([
    searchParams,
    requireAuthenticatedServerSession(),
  ]);
  const userId = session.user?.id;
  if (!userId) return null;

  const state = await getCrewRootState(userId);
  const requestedView: CrewRootView = query.view === "discover" ? "discover" : "profile";
  const view: CrewRootView = state.currentCrewId ? requestedView : "discover";

  return (
    <CrewsScreen
      crewId={state.currentCrewId ?? undefined}
      crews={state.crews}
      discoveryQuery={parseCrewDiscoveryQuery(query)}
      membership={state.currentCrewId ? "current" : "none"}
      view={view}
    />
  );
}
