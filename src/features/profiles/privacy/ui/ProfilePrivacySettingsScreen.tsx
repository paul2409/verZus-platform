// VERZUS M11.7 PROFILE PRIVACY SETTINGS SCREEN

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";

import { ProfilePrivacyResourceError } from "../adapter/profile-privacy.adapter";
import { profilePrivacyQueryOptions, profilePrivacyQueryKey } from "../api/profile-privacy.query";
import { updateProfilePrivacy } from "../api/profile-privacy.client";
import {
  profilePrivacyFields,
  type ProfilePrivacyAudience,
  type ProfilePrivacyField,
  type ProfilePrivacySaveScenario,
  type ProfilePrivacyScenario,
  type ProfilePrivacySettings,
} from "../model/profile-privacy.types";
import { profilePrivacySettingsSchema } from "../schema/profile-privacy.schema";
import styles from "./ProfilePrivacySettingsScreen.module.css";

const audiences: ProfilePrivacyAudience[] = ["public", "friends", "private"];
const readScenarios: ProfilePrivacyScenario[] = [
  "normal",
  "stale",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
];
const saveScenarios: ProfilePrivacySaveScenario[] = [
  "normal",
  "slow",
  "error",
  "conflict",
  "unavailable",
  "response-lost",
];

const fieldLabels: Record<ProfilePrivacyField, { title: string; description: string }> = {
  location: {
    title: "Location",
    description: "Controls whether viewers can see your city and country.",
  },
  crew: {
    title: "Crew membership",
    description: "Controls whether viewers can see and open your Crew.",
  },
  statistics: {
    title: "Competitive statistics",
    description: "Controls records, rating, rank, streak and points.",
  },
  trustScore: {
    title: "Trust score",
    description: "Controls the current trust score. Detailed trust events remain owner-only.",
  },
  matchHistory: {
    title: "Match history",
    description: "Controls recent verified match results on the public profile.",
  },
  gameHandles: {
    title: "Game handles",
    description: "Controls connected platform handles while retaining game names and ranks.",
  },
  achievements: {
    title: "Achievements",
    description: "Controls achievement previews and unlock progress.",
  },
  availability: {
    title: "Exact availability",
    description: "Controls exact competition windows. General availability remains visible.",
  },
};

function asReadScenario(value: string | null): ProfilePrivacyScenario {
  return readScenarios.includes(value as ProfilePrivacyScenario)
    ? (value as ProfilePrivacyScenario)
    : "normal";
}

function asSaveScenario(value: string | null): ProfilePrivacySaveScenario {
  return saveScenarios.includes(value as ProfilePrivacySaveScenario)
    ? (value as ProfilePrivacySaveScenario)
    : "normal";
}

function titleCase(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function createRequestKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `profile-privacy-${crypto.randomUUID()}`;
  }
  return `profile-privacy-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ProfilePrivacySettingsScreen() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const readScenario = asReadScenario(searchParams.get("privacyScenario"));
  const saveScenario = asSaveScenario(searchParams.get("privacySaveScenario"));
  const options = profilePrivacyQueryOptions(readScenario);
  const privacyQuery = useQuery(options);
  const [overrides, setOverrides] = useState<Partial<ProfilePrivacySettings>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<ProfilePrivacyResourceError | null>(null);
  const [pendingRequestKey, setPendingRequestKey] = useState<string | null>(null);

  const draft = useMemo<ProfilePrivacySettings | null>(() => {
    if (!privacyQuery.data) return null;
    return { ...privacyQuery.data.settings, ...overrides };
  }, [overrides, privacyQuery.data]);

  const dirty = Object.keys(overrides).length > 0;

  useEffect(() => {
    if (!dirty) return undefined;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const updateField = (field: ProfilePrivacyField, audience: ProfilePrivacyAudience) => {
    setOverrides((current) => ({ ...current, [field]: audience }));
    setSaveState("idle");
    setSaveError(null);
  };

  const save = async () => {
    if (!draft || !privacyQuery.data || saveState === "saving") return;
    const validation = profilePrivacySettingsSchema.safeParse(draft);
    if (!validation.success) {
      setSaveState("error");
      setSaveError(
        new ProfilePrivacyResourceError({
          code: "PROFILE_PRIVACY_CLIENT_VALIDATION_FAILED",
          message: "Review the privacy selections before saving.",
          requestId: "profile-privacy-client-validation",
          retryable: false,
          status: 400,
          fieldErrors: { privacy: validation.error.issues.map((issue) => issue.message) },
        }),
      );
      return;
    }

    const requestKey = pendingRequestKey ?? createRequestKey();
    setPendingRequestKey(requestKey);
    setSaveState("saving");
    setSaveError(null);

    try {
      const result = await updateProfilePrivacy({
        command: {
          expectedVersion: privacyQuery.data.version,
          settings: validation.data,
        },
        idempotencyKey: requestKey,
        scenario: saveScenario,
      });
      queryClient.setQueryData(profilePrivacyQueryKey(readScenario), result);
      setOverrides({});
      setPendingRequestKey(null);
      setSaveState("success");
    } catch (error) {
      const normalized =
        error instanceof ProfilePrivacyResourceError
          ? error
          : new ProfilePrivacyResourceError({
              code: "PROFILE_PRIVACY_UNKNOWN_SAVE_ERROR",
              message: "Privacy settings could not be saved.",
              requestId: "profile-privacy-save-unknown",
              retryable: true,
              status: 500,
            });
      setSaveError(normalized);
      setSaveState("error");
      if (normalized.code !== "PROFILE_PRIVACY_RESPONSE_LOST") {
        setPendingRequestKey(null);
      }
    }
  };

  if (privacyQuery.isPending && !privacyQuery.data) {
    return (
      <main className={styles.page} data-m11-stage="11.7" data-state="loading">
        <section aria-live="polite" className={styles.stateCard}>
          <strong>Loading privacy settings</strong>
          <p>Your current server-confirmed visibility rules are being prepared.</p>
        </section>
      </main>
    );
  }

  if (privacyQuery.isError && !privacyQuery.data) {
    const error =
      privacyQuery.error instanceof ProfilePrivacyResourceError
        ? privacyQuery.error
        : new ProfilePrivacyResourceError({
            code: "PROFILE_PRIVACY_UNKNOWN_ERROR",
            message: "Privacy settings could not be loaded.",
            requestId: "profile-privacy-load-unknown",
            retryable: true,
            status: 500,
          });
    return (
      <main className={styles.page} data-m11-stage="11.7" data-state="error">
        <section aria-live="assertive" className={styles.stateCard}>
          <strong>{error.message}</strong>
          <p>Error ID: {error.requestId}</p>
          {error.retryable ? (
            <button type="button" onClick={() => void privacyQuery.refetch()}>
              Retry privacy settings
            </button>
          ) : null}
          <Link href="/profile">Back to profile</Link>
        </section>
      </main>
    );
  }

  if (!draft || !privacyQuery.data) return null;

  return (
    <main className={styles.page} data-m11-stage="11.7" data-profile-scope="owner-settings">
      <header className={styles.pageHeader}>
        <div>
          <p>Season Zero · Owner controls</p>
          <h1>Privacy settings</h1>
          <span>Choose what public members, approved friends and only you can see.</span>
        </div>
        <div className={styles.headerActions}>
          <Link href="/players/player-prismo?viewer=member">Preview public profile</Link>
          <Link href="/profile">Back to profile</Link>
        </div>
      </header>

      <section aria-labelledby="profile-visibility-title" className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Primary access gate</p>
            <h2 id="profile-visibility-title">Profile visibility</h2>
          </div>
          <Badge tone="information" variant="outline">
            Version {privacyQuery.data.version}
          </Badge>
        </div>
        <div className={styles.visibilityOptions} role="radiogroup" aria-label="Profile visibility">
          {audiences.map((audience) => (
            <label data-selected={draft.profileVisibility === audience} key={audience}>
              <input
                checked={draft.profileVisibility === audience}
                name="profileVisibility"
                onChange={() => {
                  setOverrides((current) => ({
                    ...current,
                    profileVisibility: audience,
                  }));
                  setSaveState("idle");
                  setSaveError(null);
                }}
                type="radio"
                value={audience}
              />
              <strong>{titleCase(audience)}</strong>
              <span>
                {audience === "public"
                  ? "All VERZUS members can open your profile."
                  : audience === "friends"
                    ? "Only approved friends can open the full profile."
                    : "Only you can open the full profile."}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="field-privacy-title" className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Field-level redaction</p>
            <h2 id="field-privacy-title">Profile information</h2>
          </div>
          {privacyQuery.isFetching ? <span className={styles.refreshing}>Refreshing…</span> : null}
        </div>
        <div className={styles.fieldGrid}>
          {profilePrivacyFields.map((field) => (
            <label className={styles.fieldRow} htmlFor={`privacy-${field}`} key={field}>
              <span>
                <strong>{fieldLabels[field].title}</strong>
                <small>{fieldLabels[field].description}</small>
              </span>
              <select
                id={`privacy-${field}`}
                onChange={(event) =>
                  updateField(field, event.target.value as ProfilePrivacyAudience)
                }
                value={draft[field]}
              >
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {titleCase(audience)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="account-status" className={styles.accountPanel} id="account-status">
        <div>
          <p>Account status</p>
          <h2>Active and in good standing</h2>
          <span>
            Rank, trust events, moderation records and verification evidence cannot be hidden from
            authorized VERZUS operators.
          </span>
        </div>
        <Badge tone="positive">Active</Badge>
      </section>

      {saveError ? (
        <section aria-live="assertive" className={styles.saveFeedback} data-state="error">
          <strong>{saveError.message}</strong>
          <span>Error ID: {saveError.requestId}</span>
          {saveError.code === "PROFILE_PRIVACY_RESPONSE_LOST" ? (
            <p>The save may have completed. Use Retry safely to replay the same request.</p>
          ) : null}
        </section>
      ) : null}
      {saveState === "success" ? (
        <section aria-live="polite" className={styles.saveFeedback} data-state="success">
          <strong>Privacy settings saved</strong>
          <span>The public-profile projection now uses version {privacyQuery.data.version}.</span>
        </section>
      ) : null}

      <footer className={styles.stickyActions}>
        <div>
          <strong>{dirty ? "Unsaved privacy changes" : "Privacy settings are current"}</strong>
          <span>Last confirmed {new Date(privacyQuery.data.updatedAt).toLocaleString()}</span>
        </div>
        <button
          disabled={!dirty || saveState === "saving"}
          onClick={() => setOverrides({})}
          type="button"
        >
          Reset
        </button>
        <button
          disabled={!dirty || saveState === "saving"}
          onClick={() => void save()}
          type="button"
        >
          {saveState === "saving" ? "Saving…" : pendingRequestKey ? "Retry safely" : "Save privacy"}
        </button>
      </footer>
    </main>
  );
}
