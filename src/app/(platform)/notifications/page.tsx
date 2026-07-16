import type { Metadata } from "next";

import { getPlatformRouteById } from "@/components/layout/app-shell";
import { NotificationsScreen } from "@/features/notifications/ui";

const route = getPlatformRouteById("notifications");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
