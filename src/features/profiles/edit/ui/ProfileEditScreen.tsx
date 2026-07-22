"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/primitives/badge";

import { updateProfile } from "../api/profile-edit.client";
import {
  profileEditSchema,
  type ProfileEditSchemaInput,
  type ProfileEditSchemaOutput,
} from "../model/profile-edit.schema";
import type { ProfileEditSnapshot } from "../model/profile-edit.types";
import {
  clearProfileEditDraft,
  readProfileEditDraft,
  saveProfileEditDraft,
} from "../storage/profile-edit.storage";
import styles from "./ProfileEditScreen.module.css";

function createRequestKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `profile-edit-${crypto.randomUUID()}`
    : `profile-edit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ProfileEditScreen({ initialSnapshot }: { initialSnapshot: ProfileEditSnapshot }) {
  const router = useRouter();
  const initialFields = useMemo(
    () => readProfileEditDraft()?.fields ?? initialSnapshot.fields,
    [initialSnapshot.fields],
  );
  const [version, setVersion] = useState(initialSnapshot.version);
  const [requestKey, setRequestKey] = useState(createRequestKey);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileEditSchemaInput, unknown, ProfileEditSchemaOutput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: initialFields,
    mode: "onBlur",
  });

  const watchedFields = useWatch({
    control,
    defaultValue: initialFields,
  }) as ProfileEditSchemaInput;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const parsed = profileEditSchema.safeParse(watchedFields);
      if (parsed.success)
        saveProfileEditDraft({ fields: parsed.data, updatedAt: new Date().toISOString() });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [watchedFields]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  const submit = handleSubmit(async (fields) => {
    setSaveError(null);
    setSaveMessage(null);
    try {
      const result = await updateProfile({
        expectedVersion: version,
        fields,
        idempotencyKey: requestKey,
      });
      setVersion(result.version);
      clearProfileEditDraft();
      reset(result.fields);
      setRequestKey(createRequestKey());
      setSaveMessage(
        result.replayed
          ? `Profile version ${result.version} was confirmed again safely.`
          : `Profile version ${result.version} saved.`,
      );
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Profile could not be saved.");
    }
  });

  const displayNamePreview = watchedFields.displayName || initialSnapshot.fields.displayName;

  return (
    <main className={styles.page} data-profile-editor="production">
      <header className={styles.pageHeader}>
        <div>
          <p>Player identity</p>
          <h1>Edit profile</h1>
          <span>Identity, location and availability</span>
        </div>
        <Link className={styles.backLink} href="/profile">
          Back to profile
        </Link>
      </header>

      <section className={styles.safetyNotice} aria-labelledby="profile-edit-boundary">
        <div>
          <Badge tone="information" variant="outline">
            Server protected
          </Badge>
          <h2 id="profile-edit-boundary">Competitive records cannot be edited here</h2>
        </div>
        <p>
          Rank, trust, verification, Crew role, match records and reward progress remain
          server-owned.
        </p>
      </section>

      <form className={styles.form} noValidate onSubmit={submit}>
        <section className={styles.panel} aria-labelledby="identity-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Public identity</p>
              <h2 id="identity-heading">Player details</h2>
            </div>
            <Badge tone="information" variant="outline">
              Version {version}
            </Badge>
          </div>
          <div className={styles.fieldGrid}>
            <label>
              <span>Display name</span>
              <input
                aria-invalid={Boolean(errors.displayName)}
                maxLength={32}
                {...register("displayName")}
              />
              {errors.displayName ? <small role="alert">{errors.displayName.message}</small> : null}
            </label>
            <label>
              <span>Player handle</span>
              <input
                aria-invalid={Boolean(errors.handle)}
                maxLength={21}
                spellCheck={false}
                {...register("handle")}
              />
              {errors.handle ? <small role="alert">{errors.handle.message}</small> : null}
            </label>
            <label className={styles.fullWidth}>
              <span>Player title</span>
              <input aria-invalid={Boolean(errors.title)} maxLength={48} {...register("title")} />
              {errors.title ? <small role="alert">{errors.title.message}</small> : null}
            </label>
            <label className={styles.fullWidth}>
              <span>Bio</span>
              <textarea
                aria-invalid={Boolean(errors.bio)}
                maxLength={160}
                rows={4}
                {...register("bio")}
              />
              <div className={styles.helperLine}>
                {errors.bio ? (
                  <small role="alert">{errors.bio.message}</small>
                ) : (
                  <small>Public profile summary.</small>
                )}
                <small>{watchedFields.bio?.length ?? 0}/160</small>
              </div>
            </label>
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="location-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Region</p>
              <h2 id="location-heading">Location</h2>
            </div>
          </div>
          <div className={styles.fieldGrid}>
            <label>
              <span>Location label</span>
              <input
                aria-invalid={Boolean(errors.locationLabel)}
                maxLength={64}
                {...register("locationLabel")}
              />
              {errors.locationLabel ? (
                <small role="alert">{errors.locationLabel.message}</small>
              ) : null}
            </label>
            <label>
              <span>Country code</span>
              <input
                aria-invalid={Boolean(errors.countryCode)}
                maxLength={2}
                {...register("countryCode")}
              />
              {errors.countryCode ? <small role="alert">{errors.countryCode.message}</small> : null}
            </label>
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="availability-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Readiness</p>
              <h2 id="availability-heading">Availability</h2>
            </div>
          </div>
          <div className={styles.fieldGrid}>
            <label>
              <span>Status</span>
              <select {...register("availabilityState")}>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </label>
            <label>
              <span>Status label</span>
              <input
                aria-invalid={Boolean(errors.availabilityLabel)}
                maxLength={48}
                {...register("availabilityLabel")}
              />
              {errors.availabilityLabel ? (
                <small role="alert">{errors.availabilityLabel.message}</small>
              ) : null}
            </label>
            <label className={styles.fullWidth}>
              <span>Availability detail</span>
              <input
                aria-invalid={Boolean(errors.availabilityDetail)}
                maxLength={120}
                {...register("availabilityDetail")}
              />
              {errors.availabilityDetail ? (
                <small role="alert">{errors.availabilityDetail.message}</small>
              ) : null}
            </label>
            <label className={styles.fullWidth}>
              <span>Next window</span>
              <input
                aria-invalid={Boolean(errors.nextWindowLabel)}
                maxLength={80}
                {...register("nextWindowLabel")}
              />
              {errors.nextWindowLabel ? (
                <small role="alert">{errors.nextWindowLabel.message}</small>
              ) : null}
            </label>
          </div>
        </section>

        <section className={styles.previewPanel} aria-labelledby="edit-preview-heading">
          <div>
            <p>Public preview</p>
            <h2 id="edit-preview-heading">{displayNamePreview}</h2>
            <span>{watchedFields.handle}</span>
          </div>
          <Badge tone="special" variant="soft">
            {watchedFields.availabilityState}
          </Badge>
          <p>{watchedFields.bio || "No bio added."}</p>
          <dl>
            <div>
              <dt>Location</dt>
              <dd>{watchedFields.locationLabel || "Hidden"}</dd>
            </div>
            <div>
              <dt>Next window</dt>
              <dd>{watchedFields.nextWindowLabel || "Not set"}</dd>
            </div>
          </dl>
        </section>

        <div className={styles.statusRegion} aria-live="polite">
          {saveMessage ? <p className={styles.successMessage}>{saveMessage}</p> : null}
          {saveError ? <p className={styles.errorMessage}>{saveError}</p> : null}
        </div>
        <footer className={styles.actionBar}>
          <div>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                clearProfileEditDraft();
                reset(initialSnapshot.fields);
                setSaveError(null);
                setSaveMessage("Draft discarded.");
              }}
              type="button"
            >
              Discard draft
            </button>
          </div>
          <div>
            <button
              className={styles.secondaryButton}
              onClick={() => router.push("/profile")}
              type="button"
            >
              Cancel
            </button>
            <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </footer>
      </form>
    </main>
  );
}
