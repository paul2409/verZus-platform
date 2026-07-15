// VERZUS M5 STEPS 5.5-5.8

import type { Metadata } from "next";

import { PlayReferenceBoard } from "@/features/play/reference";

export const metadata: Metadata = {
  title: "M5 Play References | VERZUS",
  description: "Approval-only mobile, tablet, and desktop Play Command Centre references.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function M5PlayReferencesPage() {
  return <PlayReferenceBoard />;
}
