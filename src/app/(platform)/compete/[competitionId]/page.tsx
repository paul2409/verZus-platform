import type { Metadata } from "next";

import { CompetitionDetailScreen } from "@/features/competitions";

export const metadata: Metadata = {
  title: "Competition Details — VERZUS",
  description:
    "Inspect competition rules, eligibility, schedule, rewards, participants and bracket.",
};

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  return <CompetitionDetailScreen competitionId={competitionId} />;
}
