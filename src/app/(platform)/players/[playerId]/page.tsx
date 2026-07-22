import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import { PublicProfileAccountStateScreen } from "@/features/profiles/account-state/ui";
import {
  PlayerPublicProfileScreen,
  projectPublicPlayerProfile,
  readPublicPlayerProfileRecord,
} from "@/features/profiles/public-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const result = await readPublicPlayerProfileRecord(playerId);
  return result
    ? {
        title: `${result.record.identity.displayName} — VERZUS`,
        description: `View ${result.record.identity.displayName}'s VERZUS player profile.`,
      }
    : { title: "Player not found — VERZUS" };
}

export default async function PublicPlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const [result, session] = await Promise.all([
    readPublicPlayerProfileRecord(playerId),
    getServerAuthSession(),
  ]);
  if (!result) notFound();
  if (result.status !== "active") {
    return (
      <PublicProfileAccountStateScreen
        state={{
          status: result.status === "suspended" ? "suspended" : "blocked",
          playerId,
          displayName: result.record.identity.displayName,
          handle: result.record.identity.handle,
          title:
            result.status === "suspended"
              ? "Player profile suspended"
              : "Player profile unavailable",
          message: result.restrictionReason ?? "This profile is currently unavailable.",
          caseReference: null,
        }}
      />
    );
  }
  const viewerMode = session.user?.id === playerId ? "owner" : "member";
  return (
    <PlayerPublicProfileScreen model={projectPublicPlayerProfile(result.record, viewerMode)} />
  );
}
