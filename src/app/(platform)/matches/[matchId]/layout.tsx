// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE LAYOUT

import type { ReactNode } from "react";

import { MatchOperationsFeatureGate } from "@/features/matches/operations/release";

export default function MatchOperationsLayout({ children }: { children: ReactNode }) {
  return <MatchOperationsFeatureGate>{children}</MatchOperationsFeatureGate>;
}
