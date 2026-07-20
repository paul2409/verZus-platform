// VERZUS M11.7 PROFILE ACCOUNT-STATE GATE

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/primitives/badge";

import { ProfileAccountStateResourceError } from "../adapter/profile-account-state.adapter";
import { profileAccountStateQueryOptions } from "../api/profile-account-state.query";
import {
  profileAccountStateScenarios,
  type ProfileAccountState,
  type ProfileAccountStateScenario,
} from "../model/profile-account-state.types";
import styles from "./ProfileAccountStateScreen.module.css";

function asScenario(value: string | null): ProfileAccountStateScenario {
  return profileAccountStateScenarios.includes(value as ProfileAccountStateScenario)
    ? (value as ProfileAccountStateScenario)
    : "normal";
}

function StatusScreen({ state }: { state: ProfileAccountState }) {
  const tone = state.status === "empty" ? "information" : "negative";
  return (
    <main className={styles.page} data-account-state={state.status} data-m11-stage="11.7">
      <section className={styles.stateCard}>
        <div className={styles.icon} aria-hidden="true">
          {state.status === "empty" ? "+" : state.status === "suspended" ? "!" : "×"}
        </div>
        <Badge tone={tone} variant="outline">
          {state.status}
        </Badge>
        <h1>{state.title}</h1>
        <p>{state.message}</p>
        {state.caseReference ? <code>{state.caseReference}</code> : null}
        {state.reviewAtLabel ? <span>{state.reviewAtLabel}</span> : null}
        <div className={styles.actions}>
          {state.canEditProfile ? <Link href="/profile/edit">Create player identity</Link> : null}
          <Link href="/profile/settings#account-status">View account status</Link>
          <Link href="/play">Return to Play</Link>
        </div>
      </section>
    </main>
  );
}

export function ProfileAccountStateGate({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const scenario = asScenario(searchParams.get("accountScenario"));
  const query = useQuery(profileAccountStateQueryOptions(scenario));

  if (query.isPending && !query.data) {
    return (
      <main className={styles.page} data-account-state="loading" data-m11-stage="11.7">
        <section aria-live="polite" className={styles.stateCard}>
          <div className={styles.icon} aria-hidden="true">
            …
          </div>
          <h1>Confirming profile access</h1>
          <p>The server is checking the current account and profile state.</p>
        </section>
      </main>
    );
  }

  if (query.isError && !query.data) {
    const error =
      query.error instanceof ProfileAccountStateResourceError
        ? query.error
        : new ProfileAccountStateResourceError({
            code: "PROFILE_ACCOUNT_STATE_UNKNOWN_ERROR",
            message: "Profile access status could not be confirmed.",
            requestId: "profile-account-state-unknown",
            retryable: true,
            status: 500,
          });
    return (
      <main className={styles.page} data-account-state="error" data-m11-stage="11.7">
        <section aria-live="assertive" className={styles.stateCard}>
          <div className={styles.icon} aria-hidden="true">
            !
          </div>
          <Badge tone="negative" variant="outline">
            Access check unavailable
          </Badge>
          <h1>{error.message}</h1>
          <p>Profile data stays hidden until the authorization state can be confirmed.</p>
          <code>{error.requestId}</code>
          <div className={styles.actions}>
            {error.retryable ? (
              <button type="button" onClick={() => void query.refetch()}>
                Retry access check
              </button>
            ) : null}
            <Link href="/play">Return to Play</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!query.data || query.data.status !== "active") {
    return query.data ? <StatusScreen state={query.data} /> : null;
  }

  return <>{children}</>;
}
