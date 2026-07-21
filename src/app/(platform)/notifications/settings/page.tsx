// VERZUS M12.7 NOTIFICATION SETTINGS ROUTE

import type { Metadata } from "next";

import { NotificationSettingsScreen } from "@/features/notifications/settings";

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Control VERZUS notification delivery channels, categories and quiet hours.",
};

export default function NotificationSettingsPage() {
  return <NotificationSettingsScreen />;
}
