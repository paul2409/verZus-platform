// VERZUS M11.7 PROFILE PRIVACY SETTINGS ROUTE

import type { Metadata } from "next";

import { ProfilePrivacySettingsScreen } from "@/features/profiles/privacy/ui";

export const metadata: Metadata = {
  title: "Profile privacy — VERZUS",
  description: "Manage server-authoritative player profile visibility and field-level privacy.",
};

export default function ProfileSettingsPage() {
  return <ProfilePrivacySettingsScreen />;
}
