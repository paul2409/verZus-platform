// VERZUS M11.7 PUBLIC SUSPENDED AND BLOCKED PROFILE STATES

import Link from "next/link";

import { Badge } from "@/components/primitives/badge";

import type { PublicProfileAccountState } from "../model/profile-account-state.types";
import styles from "./ProfileAccountStateScreen.module.css";

export function PublicProfileAccountStateScreen({ state }: { state: PublicProfileAccountState }) {
  return (
    <main className={styles.page} data-account-state={state.status} data-m11-stage="11.7">
      <section className={styles.publicStateCard}>
        <Badge tone="negative" variant="outline">
          {state.status === "suspended" ? "Suspended profile" : "Unavailable profile"}
        </Badge>
        <div className={styles.publicIdentity}>
          <span aria-hidden="true">{state.displayName.slice(0, 1).toUpperCase()}</span>
          <div>
            <h1>{state.displayName}</h1>
            <p>{state.handle}</p>
          </div>
        </div>
        <h2>{state.title}</h2>
        <p>{state.message}</p>
        {state.caseReference ? <code>{state.caseReference}</code> : null}
        <div className={styles.actions}>
          <Link href="/search">Find another player</Link>
          <Link href="/leaderboards/weekly">Open leaderboards</Link>
        </div>
      </section>
    </main>
  );
}
