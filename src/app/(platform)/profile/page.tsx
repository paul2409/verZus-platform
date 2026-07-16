import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { ProfileScreen } from "@/features/profiles/ui";

const route = getPlatformRouteById("profile");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
