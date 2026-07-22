import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireServerAuthStates } from "@/features/auth/server";

export const metadata: Metadata = {
  title: {
    default: "Player onboarding",
    template: "%s | VERZUS",
  },
  description: "Create and activate your VERZUS competitive player identity.",
};

export default async function OnboardingLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireServerAuthStates(["onboarding_incomplete"]);
  return children;
}
