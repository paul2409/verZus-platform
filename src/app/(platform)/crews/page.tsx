import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { CrewsScreen } from "@/features/crews";

const route = getPlatformRouteById("crews");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function CrewsPage() {
  return <CrewsScreen />;
}
