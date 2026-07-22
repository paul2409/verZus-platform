import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { requireAuthenticatedServerSession } from "@/features/auth/server/auth-session.server";
import { listVisibleMatches } from "@/features/matches/operations/server";
import { MatchesScreen } from "@/features/matches";

const route = getPlatformRouteById("matches");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const session = await requireAuthenticatedServerSession();
  const user = session.user;
  if (!user) return null;
  const items = await listVisibleMatches(user.id, user.role);
  return <MatchesScreen items={items} />;
}
