// VERZUS M7.7 ROUTE ACCESS AND MAINTENANCE STATES

import Link from "next/link";

import type { MatchAccessState } from "../model/match-terminal-operations.types";
import styles from "./MatchOperationsScreen.module.css";

const accessCopy = {
  unauthorized: {
    eyebrow: "SESSION REQUIRED",
    title: "Sign in to view this match",
    description: "Your session is missing or expired. Match data and actions remain protected.",
    href: "/login",
    action: "Go to sign in",
  },
  forbidden: {
    eyebrow: "ACCESS DENIED",
    title: "You cannot access this match",
    description:
      "This match belongs to another participant or requires an elevated operations role.",
    href: "/play",
    action: "Return to Play",
  },
  not_found: {
    eyebrow: "MATCH NOT FOUND",
    title: "This match is unavailable",
    description: "The match may have been archived, removed, or the link may be incorrect.",
    href: "/matches",
    action: "View matches",
  },
  maintenance: {
    eyebrow: "MATCH OPS MAINTENANCE",
    title: "Match operations are temporarily paused",
    description:
      "Navigation remains available. Active match mutations are disabled until service health is restored.",
    href: "/play",
    action: "Return to Play",
  },
} as const;

export function MatchAccessStateScreen({
  state,
}: {
  state: Exclude<MatchAccessState, "authorized">;
}) {
  const copy = accessCopy[state];
  return (
    <main className={styles.accessStatePage} data-access-state={state} data-m7-stage="7.7">
      <section className={styles.accessStateCard}>
        <p>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <span>{copy.description}</span>
        <Link href={copy.href}>{copy.action}</Link>
      </section>
    </main>
  );
}
