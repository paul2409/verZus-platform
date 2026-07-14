// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import type { Metadata } from "next";

import { OnboardingExperience } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function OnboardingPage() {
  return <OnboardingExperience step="welcome" />;
}
