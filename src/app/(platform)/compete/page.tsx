import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { CompetitionDiscoveryScreen } from "@/features/competitions";

const route = getPlatformRouteById("compete");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function CompetePage() {
  return <CompetitionDiscoveryScreen />;
}
