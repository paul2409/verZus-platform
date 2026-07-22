"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";

import { ProfilePrivacyResourceError } from "../adapter/profile-privacy.adapter";
import { updateProfilePrivacy } from "../api/profile-privacy.client";
import { profilePrivacyQueryKey, profilePrivacyQueryOptions } from "../api/profile-privacy.query";
import {
  profilePrivacyFields,
  type ProfilePrivacyAudience,
  type ProfilePrivacyField,
  type ProfilePrivacySettings,
} from "../model/profile-privacy.types";
import { profilePrivacySettingsSchema } from "../schema/profile-privacy.schema";
import styles from "./ProfilePrivacySettingsScreen.module.css";

const audiences: ProfilePrivacyAudience[] = ["public", "friends", "private"];
const fieldLabels: Record<ProfilePrivacyField, string> = {
  location: "Location",
  crew: "Crew membership",
  statistics: "Competitive statistics",
  trustScore: "Trust score",
  matchHistory: "Match history",
  gameHandles: "Game handles",
  achievements: "Achievements",
  availability: "Exact availability",
};

function createRequestKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `profile-privacy-${crypto.randomUUID()}`
    : `profile-privacy-${Date.now()}`;
}

export function ProfilePrivacySettingsScreen() {
  const queryClient = useQueryClient();
  const privacyQuery = useQuery(profilePrivacyQueryOptions());
  const [overrides, setOverrides] = useState<Partial<ProfilePrivacySettings>>({});
  const [saveError, setSaveError] = useState<ProfilePrivacyResourceError | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [requestKey, setRequestKey] = useState(createRequestKey);
  const draft = useMemo(
    () => (privacyQuery.data ? { ...privacyQuery.data.settings, ...overrides } : null),
    [privacyQuery.data, overrides],
  );
  const dirty = Object.keys(overrides).length > 0;

  useEffect(() => {
    if (!dirty) return undefined;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  async function save() {
    if (!draft || !privacyQuery.data || saving) return;
    const parsed = profilePrivacySettingsSchema.safeParse(draft);
    if (!parsed.success) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const result = await updateProfilePrivacy({
        command: { expectedVersion: privacyQuery.data.version, settings: parsed.data },
        idempotencyKey: requestKey,
      });
      queryClient.setQueryData(profilePrivacyQueryKey, result);
      setOverrides({});
      setRequestKey(createRequestKey());
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof ProfilePrivacyResourceError
          ? error
          : new ProfilePrivacyResourceError({
              code: "PROFILE_PRIVACY_SAVE_FAILED",
              message: "Privacy settings could not be saved.",
              requestId: "privacy-save-unknown",
              retryable: true,
              status: 500,
            }),
      );
    } finally {
      setSaving(false);
    }
  }

  if (privacyQuery.isPending && !privacyQuery.data)
    return (
      <main className={styles.page}>
        <section className={styles.stateCard}>
          <strong>Loading privacy settings</strong>
        </section>
      </main>
    );
  if (privacyQuery.isError || !privacyQuery.data || !draft)
    return (
      <main className={styles.page}>
        <section className={styles.stateCard}>
          <strong>Privacy settings could not be loaded.</strong>
          <button type="button" onClick={() => void privacyQuery.refetch()}>
            Retry
          </button>
        </section>
      </main>
    );

  return (
    <main className={styles.page} data-profile-scope="owner-settings">
      <header className={styles.pageHeader}>
        <div>
          <p>Owner controls</p>
          <h1>Privacy settings</h1>
          <span>Choose what other players can see.</span>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/players/${privacyQuery.data.playerId}`}>Preview public profile</Link>
          <Link href="/profile">Back to profile</Link>
        </div>
      </header>
      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Primary access gate</p>
            <h2>Profile visibility</h2>
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
                  setOverrides((current) => ({ ...current, profileVisibility: audience }));
                  setSaved(false);
                }}
                type="radio"
                value={audience}
              />
              <strong>{audience}</strong>
              <span>
                {audience === "public"
                  ? "All VERZUS members can open the profile."
                  : audience === "friends"
                    ? "Only approved friends can open the full profile."
                    : "Only you can open the full profile."}
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Field-level redaction</p>
            <h2>Profile information</h2>
          </div>
        </div>
        <div className={styles.fieldGrid}>
          {profilePrivacyFields.map((field) => (
            <label className={styles.fieldRow} htmlFor={`privacy-${field}`} key={field}>
              <span>
                <strong>{fieldLabels[field]}</strong>
                <small>Choose who can view this information.</small>
              </span>
              <select
                id={`privacy-${field}`}
                value={draft[field]}
                onChange={(event) => {
                  setOverrides((current) => ({
                    ...current,
                    [field]: event.target.value as ProfilePrivacyAudience,
                  }));
                  setSaved(false);
                }}
              >
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>
      {saveError ? (
        <section className={styles.saveFeedback} data-state="error">
          <strong>{saveError.message}</strong>
          <span>Error ID: {saveError.requestId}</span>
        </section>
      ) : null}
      {saved ? (
        <section className={styles.saveFeedback} data-state="success">
          <strong>Privacy settings saved</strong>
        </section>
      ) : null}
      <footer className={styles.stickyActions}>
        <div>
          <strong>{dirty ? "Unsaved privacy changes" : "Privacy settings are current"}</strong>
          <span>Last confirmed {new Date(privacyQuery.data.updatedAt).toLocaleString()}</span>
        </div>
        <button disabled={!dirty || saving} onClick={() => setOverrides({})} type="button">
          Reset
        </button>
        <button disabled={!dirty || saving} onClick={() => void save()} type="button">
          {saving ? "Saving…" : "Save privacy"}
        </button>
      </footer>
    </main>
  );
}
