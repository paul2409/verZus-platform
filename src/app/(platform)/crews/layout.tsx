// VERZUS M9.8 CREW FEATURE ISOLATION LAYOUT

import type { ReactNode } from "react";

import { CrewFeatureGate } from "@/features/crews/release";

export default function CrewLayout({ children }: { children: ReactNode }) {
  return <CrewFeatureGate>{children}</CrewFeatureGate>;
}
