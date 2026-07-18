// VERZUS M9.3 CREW CREATION ROUTE

import type { Metadata } from "next";

import { CrewCreationScreen, CrewSurfaceTelemetry, parseCrewCreationStep } from "@/features/crews";

export const metadata: Metadata = {
  title: "Create Crew — VERZUS",
  description: "Create a Crew identity, choose original assets and configure its forming state.",
};

export default async function CrewCreationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const membership = query.membership === "current" ? "current" : "none";

  return (
    <>
      <CrewSurfaceTelemetry surface="creation" />
      <CrewCreationScreen initialStep={parseCrewCreationStep(query.step)} membership={membership} />
    </>
  );
}
