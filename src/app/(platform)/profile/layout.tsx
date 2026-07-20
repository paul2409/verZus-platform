// VERZUS M11.8 OWN PROFILE FEATURE ISOLATION

import type { ReactNode } from "react";

import { ProfileFeatureGate, ProfileReleaseBoundary } from "@/features/profiles/release";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileReleaseBoundary surface="owner-profile">
      <ProfileFeatureGate>{children}</ProfileFeatureGate>
    </ProfileReleaseBoundary>
  );
}
