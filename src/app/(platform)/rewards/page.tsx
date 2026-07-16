import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { RewardsScreen } from "@/features/rewards";

const route = getPlatformRouteById("rewards");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function RewardsPage() {
  return <RewardsScreen />;
}
