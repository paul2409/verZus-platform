import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { MatchesScreen } from "@/features/matches";

const route = getPlatformRouteById("matches");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function MatchesPage() {
  return <MatchesScreen />;
}
