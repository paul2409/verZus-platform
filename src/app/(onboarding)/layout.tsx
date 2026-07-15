// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Player onboarding",
    template: "%s | VERZUS",
  },
  description: "Create and activate your VERZUS competitive player identity.",
};

export default function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
