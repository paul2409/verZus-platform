// VERZUS M6.7 COMPETITION RELEASE GATE

import type { ReactNode } from "react";

import { CompetitionFeatureGate } from "@/features/competitions/release";

export default function CompeteLayout({ children }: { children: ReactNode }) {
  return <CompetitionFeatureGate>{children}</CompetitionFeatureGate>;
}
