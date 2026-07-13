import type { Metadata } from "next";

import { getPlatformRouteById, PlatformRoutePlaceholder } from "@/components/layout/app-shell";

const route = getPlatformRouteById("play");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function PlayPage() {
  return <PlatformRoutePlaceholder routeId="play" />;
}
