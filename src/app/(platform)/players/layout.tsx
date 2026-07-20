// VERZUS M11.8 PUBLIC PROFILE FEATURE ISOLATION

import type { ReactNode } from "react";

import { ProfileFeatureGate, ProfileReleaseBoundary } from "@/features/profiles/release";

export default function PlayersLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileReleaseBoundary surface="public-profile">
      <ProfileFeatureGate>{children}</ProfileFeatureGate>
    </ProfileReleaseBoundary>
  );
}
