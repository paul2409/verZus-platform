// VERZUS M12.7 NOTIFICATION SETTINGS SCREEN

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ResourceStatePanel } from "@/components/feedback/resource-state";
import { classifyResourceFailure } from "@/lib/reliability/resource-reliability";

import { NotificationSettingsError } from "../adapter/notification-settings.adapter";
import { notificationSettingsQueryOptions } from "../api/notification-settings.query";
import { useNotificationSettingsMutation } from "../hooks/useNotificationSettingsMutation";
import type {
  NotificationCategoryPreferences,
  NotificationSettingsPreferences,
  NotificationSettingsScenario,
  NotificationSettingsSnapshot,
} from "../model/notification-settings.types";
import styles from "./NotificationSettingsScreen.module.css";

const scenarioSet = new Set<NotificationSettingsScenario>([
  "normal",
  "slow",
  "error",
  "offline",
  "malformed",
  "unauthorized",
  "forbidden",
  "maintenance",
  "conflict",
]);

const categoryRows: Array<{
  id: Exclude<keyof NotificationCategoryPreferences, "security">;
  title: string;
  description: string;
}> = [
  { id: "match", title: "Matches", description: "Check-in, opponent, result and dispute updates." },
  { id: "competition", title: "Competitions", description: "Registration, schedule and eligibility changes." },
  { id: "crew", title: "Crews", description: "Invites, applications, roster and Crew events." },
  { id: "reward", title: "Rewards", description: "Unlocks, claims and progression milestones." },
  { id: "system", title: "Platform", description: "Maintenance, policy and account-service notices." },
];

const timeZones = [
  "Africa/Lagos",
  "UTC",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

function parseNotificationSettingsScenario(value: string | null): NotificationSettingsScenario {
  return scenarioSet.has(value as NotificationSettingsScenario)
    ? (value as NotificationSettingsScenario)
    : "normal";
}

function minuteToTime(value: number): string {
  const normalized = Math.min(1439, Math.max(0, value));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeToMinute(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Math.min(1439, Math.max(0, Number(hours) * 60 + Number(minutes)));
}

function preferencesOf(snapshot: NotificationSettingsSnapshot): NotificationSettingsPreferences {
  return {
    channels: snapshot.channels,
    categories: snapshot.categories,
    quietHours: snapshot.quietHours,
    emailDigest: snapshot.emailDigest,
  };
}

function settingsErrorDescriptor(error: Error | null) {
  const known = error instanceof NotificationSettingsError ? error : null;
  return classifyResourceFailure({
    resourceLabel: "Notification settings",
    code: known?.code,
    message: known?.message ?? error?.message,
    requestId: known?.requestId,
    retryable: known?.retryable,
    status: known?.status,
  });
}

function SettingsForm(props: {
  snapshot: NotificationSettingsSnapshot;
  mutationScenario: NotificationSettingsScenario;
}) {
  const mutation = useNotificationSettingsMutation();
  const initial = useMemo(() => preferencesOf(props.snapshot), [props.snapshot]);
  const [draft, setDraft] = useState<NotificationSettingsPreferences>(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const setChannel = (channel: "email" | "push", enabled: boolean) => {
    setDraft((current) => ({
      ...current,
      channels: { ...current.channels, [channel]: enabled },
    }));
  };

  const setCategory = (
    category: Exclude<keyof NotificationCategoryPreferences, "security">,
    enabled: boolean,
  ) => {
    setDraft((current) => ({
      ...current,
      categories: { ...current.categories, [category]: enabled },
    }));
  };

  const save = async () => {
    try {
      await mutation.submit({
        preferences: draft,
        expectedVersion: props.snapshot.version,
        idempotencyKey: `m12-7-settings-${crypto.randomUUID()}`,
        scenario: props.mutationScenario,
      });
    } catch {
      // Local mutation recovery remains visible with the original idempotency key.
    }
  };

  const retry = async () => {
    try {
      await mutation.retry();
    } catch {
      // Keep the local recovery panel visible.
    }
  };

  return (
    <div className={styles.settingsGrid}>
      <section className={styles.formColumn} aria-label="Notification delivery preferences">
        <section className={styles.preferenceSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Delivery channels</p>
              <h2>Choose where signals arrive</h2>
            </div>
            <span>Version {props.snapshot.version}</span>
          </div>

          <label className={styles.preferenceRow}>
            <span>
              <strong>In-app notifications</strong>
              <small>Required for match safety, security and platform operations.</small>
            </span>
            <input checked disabled type="checkbox" />
          </label>
          <label className={styles.preferenceRow}>
            <span>
              <strong>Email</strong>
              <small>Receive selected signals outside VERZUS.</small>
            </span>
            <input
              checked={draft.channels.email}
              onChange={(event) => setChannel("email", event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className={styles.preferenceRow}>
            <span>
              <strong>Push</strong>
              <small>Prepare browser and future mobile push delivery.</small>
            </span>
            <input
              checked={draft.channels.push}
              onChange={(event) => setChannel("push", event.target.checked)}
              type="checkbox"
            />
          </label>
        </section>

        <section className={styles.preferenceSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Signal categories</p>
              <h2>Control non-critical interruptions</h2>
            </div>
          </div>

          {categoryRows.map((row) => (
            <label className={styles.preferenceRow} key={row.id}>
              <span>
                <strong>{row.title}</strong>
                <small>{row.description}</small>
              </span>
              <input
                checked={draft.categories[row.id]}
                onChange={(event) => setCategory(row.id, event.target.checked)}
                type="checkbox"
              />
            </label>
          ))}
          <label className={styles.preferenceRow}>
            <span>
              <strong>Security</strong>
              <small>Sign-in, account protection and high-risk action notices cannot be disabled.</small>
            </span>
            <input checked disabled type="checkbox" />
          </label>
        </section>

        <section className={styles.preferenceSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Quiet hours</p>
              <h2>Reduce low-priority delivery overnight</h2>
            </div>
          </div>

          <label className={styles.preferenceRow}>
            <span>
              <strong>Enable quiet hours</strong>
              <small>Critical match and security signals still appear in-app.</small>
            </span>
            <input
              checked={draft.quietHours.enabled}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  quietHours: { ...current.quietHours, enabled: event.target.checked },
                }))
              }
              type="checkbox"
            />
          </label>

          <div className={styles.fieldGrid}>
            <label>
              <span>Starts</span>
              <input
                disabled={!draft.quietHours.enabled}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quietHours: {
                      ...current.quietHours,
                      startMinute: timeToMinute(event.target.value),
                    },
                  }))
                }
                type="time"
                value={minuteToTime(draft.quietHours.startMinute)}
              />
            </label>
            <label>
              <span>Ends</span>
              <input
                disabled={!draft.quietHours.enabled}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quietHours: {
                      ...current.quietHours,
                      endMinute: timeToMinute(event.target.value),
                    },
                  }))
                }
                type="time"
                value={minuteToTime(draft.quietHours.endMinute)}
              />
            </label>
            <label>
              <span>Timezone</span>
              <select
                disabled={!draft.quietHours.enabled}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quietHours: { ...current.quietHours, timeZone: event.target.value },
                  }))
                }
                value={draft.quietHours.timeZone}
              >
                {timeZones.map((zone) => <option key={zone}>{zone}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className={styles.preferenceSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Email digest</p>
              <h2>Batch non-critical email delivery</h2>
            </div>
          </div>
          <label className={styles.selectRow}>
            <span>Email frequency</span>
            <select
              disabled={!draft.channels.email}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  emailDigest: event.target.value as NotificationSettingsPreferences["emailDigest"],
                }))
              }
              value={draft.emailDigest}
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </label>
        </section>

        {mutation.error ? (
          <section className={styles.mutationError} role="alert">
            <div>
              <p className={styles.eyebrow}>Save not confirmed</p>
              <strong>{mutation.error.message}</strong>
              {mutation.error instanceof NotificationSettingsError ? (
                <code>{mutation.error.requestId}</code>
              ) : null}
            </div>
            <div className={styles.inlineActions}>
              {mutation.error instanceof NotificationSettingsError && mutation.error.retryable ? (
                <button onClick={() => void retry()} type="button">Retry same request</button>
              ) : null}
              <button onClick={mutation.reset} type="button">Dismiss</button>
            </div>
          </section>
        ) : null}

        {mutation.data ? (
          <section className={styles.successNotice} role="status">
            <strong>{mutation.data.replayed ? "Replay confirmed" : "Preferences saved"}</strong>
            <span>Settings version {mutation.data.settings.version} is now authoritative.</span>
          </section>
        ) : null}

        <section className={styles.saveBar} aria-label="Save notification settings">
          <div>
            <strong>{dirty ? "Unsaved changes" : "Preferences synchronized"}</strong>
            <span>Last confirmed {new Date(props.snapshot.updatedAt).toLocaleString()}</span>
          </div>
          <div className={styles.inlineActions}>
            <button
              disabled={!dirty || mutation.isPending}
              onClick={() => setDraft(initial)}
              type="button"
            >
              Reset
            </button>
            <button
              className={styles.primaryButton}
              disabled={!dirty || mutation.isPending}
              onClick={() => void save()}
              type="button"
            >
              {mutation.isPending ? "Saving…" : "Save preferences"}
            </button>
          </div>
        </section>
      </section>

      <aside className={styles.sideRail}>
        <section>
          <p className={styles.eyebrow}>Safety guardrail</p>
          <h2>Critical signals stay on</h2>
          <p>In-app and security notifications remain enabled so check-in, account and dispute actions cannot disappear.</p>
        </section>
        <section>
          <p className={styles.eyebrow}>Mutation contract</p>
          <h2>Versioned and replay safe</h2>
          <p>Saves use an expected version and an idempotency key. Conflicts never overwrite a newer preference snapshot.</p>
        </section>
        <section className={styles.requestCard}>
          <span>Read request</span>
          <code>{props.snapshot.requestId}</code>
        </section>
      </aside>
    </div>
  );
}

function SettingsExperience(props: {
  readScenario: NotificationSettingsScenario;
  mutationScenario: NotificationSettingsScenario;
}) {
  const resource = useQuery(notificationSettingsQueryOptions(props.readScenario));

  return (
    <main className={styles.page} data-m12-stage="12.7">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>12.7 // Delivery preferences</p>
          <h1>Notification settings</h1>
          <p>
            Keep competitive and account-critical signals reliable while controlling optional delivery channels and timing.
          </p>
        </div>
        <Link className={styles.backLink} href="/notifications">Back to signal centre</Link>
      </header>

      {resource.isPending ? (
        <section aria-busy="true" className={styles.loadingState}>
          <span>Loading notification preferences…</span>
          {Array.from({ length: 4 }, (_, index) => <div key={index} />)}
        </section>
      ) : resource.isError ? (
        <ResourceStatePanel
          descriptor={settingsErrorDescriptor(resource.error)}
          onRetry={() => void resource.refetch()}
          retryLabel="Retry settings"
          secondaryHref={
            settingsErrorDescriptor(resource.error).state === "unauthorized"
              ? "/login"
              : "/notifications"
          }
          secondaryLabel={
            settingsErrorDescriptor(resource.error).state === "unauthorized"
              ? "Sign in"
              : "Back to notifications"
          }
        />
      ) : resource.data ? (
        <SettingsForm
          key={resource.data.version}
          mutationScenario={props.mutationScenario}
          snapshot={resource.data}
        />
      ) : null}

      <footer className={styles.stageNote}>
        <strong>M12.7 notification settings</strong>
        <span>Preferences are isolated from notification reads, unread badges, Search and Activity.</span>
      </footer>
    </main>
  );
}

export function NotificationSettingsScreen() {
  const searchParams = useSearchParams();
  const readScenario = parseNotificationSettingsScenario(searchParams.get("scenario"));
  const mutationScenario = parseNotificationSettingsScenario(searchParams.get("mutationScenario"));

  return (
    <SettingsExperience
      key={`${readScenario}:${mutationScenario}`}
      mutationScenario={mutationScenario}
      readScenario={readScenario}
    />
  );
}
