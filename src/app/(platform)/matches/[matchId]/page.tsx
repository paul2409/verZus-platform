import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAuthenticatedServerSession } from "@/features/auth/server/auth-session.server";
import type { MatchTerminalRole } from "@/features/matches/operations/model/match-terminal-operations.types";
import {
  getInitialMatchViewModel,
  MatchOperationsResourceScreen,
  ProductionMatchError,
} from "@/features/matches";

export const metadata: Metadata = {
  title: "Match Operations — VERZUS",
  description: "Check in, enter the lobby, submit results and track authoritative match state.",
};

export const dynamic = "force-dynamic";

function viewerRole(role: string): MatchTerminalRole {
  if (role === "referee") return "support";
  if (role === "admin" || role === "superadmin") return "admin";
  return "current_user";
}

export default async function MatchOperationsPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const [{ matchId }, session] = await Promise.all([
    params,
    requireAuthenticatedServerSession(),
  ]);
  if (!session.user) return null;

  try {
    const initialMatch = await getInitialMatchViewModel({
      matchId,
      userId: session.user.id,
      role: session.user.role,
    });
    return (
      <MatchOperationsResourceScreen
        crashWidget={null}
        failureResource={null}
        initialMatch={initialMatch}
        resourceState={initialMatch.state}
        scenario="normal"
        viewerRole={viewerRole(session.user.role)}
      />
    );
  } catch (error) {
    if (error instanceof ProductionMatchError && error.status === 404) notFound();
    throw error;
  }
}
