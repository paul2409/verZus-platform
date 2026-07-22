import type { Metadata } from "next";

import { CrewsScreen } from "@/features/crews";

export const metadata: Metadata = {
  title: "Crew Profile — VERZUS",
  description: "Crew identity, rankings, roster, activity and operations overview.",
};

export default async function CrewProfilePage({
  params,
}: {
  params: Promise<{ crewId: string }>;
}) {
  const { crewId } = await params;
  return <CrewsScreen crewId={crewId} crews={[]} membership="none" view="profile" />;
}
