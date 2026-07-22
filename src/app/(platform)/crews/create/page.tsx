import type { Metadata } from "next";

import { requireAuthenticatedServerSession } from "@/features/auth/server";
import { CrewCreationScreen, CrewSurfaceTelemetry, parseCrewCreationStep } from "@/features/crews";
import { getCurrentCrewId } from "@/features/crews/server";

export const metadata: Metadata = {
  title: "Create Crew — VERZUS",
  description: "Create a Crew identity and configure its initial operating settings.",
};

export default async function CrewCreationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [query, session] = await Promise.all([
    searchParams,
    requireAuthenticatedServerSession(),
  ]);
  const userId = session.user?.id;
  if (!userId) return null;
  const currentCrewId = await getCurrentCrewId(userId);

  return (
    <>
      <CrewSurfaceTelemetry surface="creation" />
      <CrewCreationScreen
        initialStep={parseCrewCreationStep(query.step)}
        membership={currentCrewId ? "current" : "none"}
      />
    </>
  );
}
