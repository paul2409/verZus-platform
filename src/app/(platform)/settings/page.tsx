import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { SettingsScreen } from "@/features/settings/ui";

const route = getPlatformRouteById("settings");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
