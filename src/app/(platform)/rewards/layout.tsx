// VERZUS M10.8 REWARD DOMAIN FEATURE ISOLATION

import type { ReactNode } from "react";

import { RewardFeatureGate } from "@/features/rewards/release";

export default function RewardsLayout({ children }: { children: ReactNode }) {
  return <RewardFeatureGate>{children}</RewardFeatureGate>;
}
