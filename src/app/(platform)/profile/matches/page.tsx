// VERZUS M11.5 COMPLETE MATCH HISTORY ROUTE
import type { Metadata } from "next";
import { PlayerMatchHistoryScreen } from "@/features/profiles/history";

export const metadata: Metadata = {
  title: "Match history | VERZUS",
  description: "Review confirmed match results, game filters and detailed player statistics.",
};

export default function ProfileMatchesPage() {
  return <PlayerMatchHistoryScreen />;
}
