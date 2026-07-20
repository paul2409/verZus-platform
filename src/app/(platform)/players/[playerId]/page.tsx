// VERZUS M11.7 SERVER-AUTHORITATIVE PUBLIC PLAYER ROUTE AND ACCOUNT STATES

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfileAccountStateScreen } from "@/features/profiles/account-state/ui";
import { getPublicProfileAccountState } from "@/features/profiles/account-state/server";
import {
  getPublicPlayerProfileRecord,
  parsePublicProfileViewerMode,
  PlayerPublicProfileScreen,
  projectPublicPlayerProfile,
} from "@/features/profiles/public-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const accountState = getPublicProfileAccountState(playerId);
  if (accountState.status !== "active") {
    return {
      title: `${accountState.displayName} — VERZUS`,
      description: accountState.message,
    };
  }

  const record = getPublicPlayerProfileRecord(playerId);
  if (!record) {
    return {
      title: "Player not found — VERZUS",
      description: "The requested VERZUS player profile could not be found.",
    };
  }

  return {
    title: `${record.identity.displayName} — VERZUS`,
    description: `View ${record.identity.displayName}'s permission-aware public VERZUS player profile.`,
  };
}

export default async function PublicPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ viewer?: string | string[] }>;
}) {
  const [{ playerId }, query] = await Promise.all([params, searchParams]);
  const accountState = getPublicProfileAccountState(playerId);
  if (accountState.status !== "active") {
    return <PublicProfileAccountStateScreen state={accountState} />;
  }

  const record = getPublicPlayerProfileRecord(playerId);
  if (!record) notFound();

  const viewerMode = parsePublicProfileViewerMode(query.viewer);
  const model = projectPublicPlayerProfile(record, viewerMode);

  return <PlayerPublicProfileScreen model={model} />;
}
