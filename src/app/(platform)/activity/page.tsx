// VERZUS M12.5 PERSONALIZED ACTIVITY ROUTE

import type { Metadata } from "next";

import { ActivityScreen } from "@/features/activity";

export const metadata: Metadata = {
  title: "Activity Feed",
  description: "Personalized verified activity across matches, Crews, competitions, rankings and rewards.",
};

export default function ActivityPage() {
  return <ActivityScreen />;
}
