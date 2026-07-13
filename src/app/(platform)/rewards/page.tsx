import type { Metadata } from "next";

import { getPlatformRouteById, PlatformRoutePlaceholder } from "@/components/layout/app-shell";

const route = getPlatformRouteById("rewards");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function RewardsPage() {
  return <PlatformRoutePlaceholder routeId="rewards" />;
}
