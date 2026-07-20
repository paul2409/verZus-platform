// VERZUS M11.3 PROFILE EDITING AND VALIDATION SCREEN

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/primitives/badge";

import { ownPlayerProfileMock } from "../../foundation";
import {
  profileAvatarRules,
  profileEditSchema,
  type ProfileEditSchemaInput,
  type ProfileEditSchemaOutput,
} from "../model/profile-edit.schema";
import {
  emptyAvatarDraft,
  profileFieldsFromModel,
  type ProfileAvatarDraft,
} from "../model/profile-edit.types";
import {
  clearConfirmedProfileEdit,
  clearProfileEditDraft,
  readProfileEditSnapshot,
  saveConfirmedProfileEdit,
  saveProfileEditDraft,
} from "../storage/profile-edit.storage";
import styles from "./ProfileEditScreen.module.css";

const acceptedAvatarTypes = profileAvatarRules.allowedMimeTypes.join(",");

function createRequestKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `profile-edit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readImageDimensions(dataUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The selected file could not be decoded as an image."));
    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

function getInitialState() {
  const snapshot = readProfileEditSnapshot();
  const confirmedFields =
    snapshot.confirmed?.fields ?? profileFieldsFromModel(ownPlayerProfileMock);
  const fields = snapshot.draft?.fields ?? confirmedFields;
  const avatar = snapshot.draft?.avatar ?? snapshot.confirmed?.avatar ?? emptyAvatarDraft();

  return { fields, avatar };
}

export function ProfileEditScreen() {
  const router = useRouter();
  const initialState = useMemo(() => getInitialState(), []);
  const initialHadDraft = useMemo(() => Boolean(readProfileEditSnapshot().draft), []);
  const [avatar, setAvatar] = useState<ProfileAvatarDraft>(initialState.avatar);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(() => createRequestKey());

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileEditSchemaInput, unknown, ProfileEditSchemaOutput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: initialState.fields,
    mode: "onBlur",
  });

  const watchedFields = useWatch({
    control,
    defaultValue: initialState.fields,
  }) as ProfileEditSchemaInput;
  const hasUnsavedChanges =
    isDirty || initialHadDraft || avatar.dataUrl !== initialState.avatar.dataUrl;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const parsed = profileEditSchema.safeParse(watchedFields);
      if (parsed.success) {
        saveProfileEditDraft({
          fields: parsed.data,
          avatar,
          updatedAt: new Date().toISOString(),
        });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [avatar, watchedFields]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  async function handleAvatarSelection(file: File | undefined) {
    setAvatarError(null);
    setSaveMessage(null);

    if (!file) {
      return;
    }

    if (!profileAvatarRules.allowedMimeTypes.includes(file.type as never)) {
      setAvatarError("Use a JPEG, PNG or WebP image. SVG and GIF files are not accepted.");
      return;
    }

    if (file.size > profileAvatarRules.maximumBytes) {
      setAvatarError("Avatar images must be 2 MB or smaller.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await readImageDimensions(dataUrl);

      if (
        dimensions.width < profileAvatarRules.minimumDimension ||
        dimensions.height < profileAvatarRules.minimumDimension
      ) {
        setAvatarError("Avatar images must be at least 256 by 256 pixels.");
        return;
      }

      if (
        dimensions.width > profileAvatarRules.maximumDimension ||
        dimensions.height > profileAvatarRules.maximumDimension
      ) {
        setAvatarError("Avatar images must not exceed 4096 by 4096 pixels.");
        return;
      }

      setAvatar({
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
      });
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "The avatar could not be processed.");
    }
  }

  const submit = handleSubmit(async (fields) => {
    setSaveError(null);
    setSaveMessage(null);

    try {
      const result = await saveConfirmedProfileEdit({
        fields,
        avatar,
        requestKey,
      });

      clearProfileEditDraft();
      reset(result.record.fields);
      setRequestKey(createRequestKey());
      setSaveMessage(
        result.replayed
          ? `Saved profile version ${result.record.version} was confirmed again without duplication.`
          : `Profile version ${result.record.version} saved successfully.`,
      );
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The profile could not be saved.");
    }
  });

  function discardDraft() {
    const snapshot = readProfileEditSnapshot();
    const fields = snapshot.confirmed?.fields ?? profileFieldsFromModel(ownPlayerProfileMock);
    const confirmedAvatar = snapshot.confirmed?.avatar ?? emptyAvatarDraft();

    clearProfileEditDraft();
    reset(fields);
    setAvatar(confirmedAvatar);
    setAvatarError(null);
    setSaveError(null);
    setSaveMessage("Unsaved draft changes were discarded.");
  }

  function restoreFoundationProfile() {
    clearConfirmedProfileEdit();
    const fields = profileFieldsFromModel(ownPlayerProfileMock);
    reset(fields);
    setAvatar(emptyAvatarDraft());
    setAvatarError(null);
    setSaveError(null);
    setSaveMessage("The local profile override was removed.");
    setRequestKey(createRequestKey());
  }

  const avatarPreview = avatar.dataUrl || ownPlayerProfileMock.identity.avatarSrc;
  const displayNamePreview = watchedFields.displayName || ownPlayerProfileMock.identity.displayName;

  return (
    <main className={styles.page} data-m11-stage="11.3" data-profile-editor="true">
      <header className={styles.pageHeader}>
        <div>
          <p>M11.3 · Own profile</p>
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
            Safe editing boundary
          </Badge>
          <h2 id="profile-edit-boundary">Competitive records remain server-owned</h2>
        </div>
        <p>
          Rank, trust, verification, Crew role, match records and reward progress cannot be edited
          here.
        </p>
      </section>

      <form className={styles.form} noValidate onSubmit={submit}>
        <section className={styles.panel} aria-labelledby="avatar-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Profile image</p>
              <h2 id="avatar-heading">Avatar</h2>
            </div>
            <Badge tone={avatar.dataUrl ? "positive" : "neutral"}>
              {avatar.dataUrl ? "New preview" : "Current image"}
            </Badge>
          </div>

          <div className={styles.avatarEditor}>
            <div className={styles.avatarPreview}>
              {avatarPreview ? (
                <Image
                  alt={`${displayNamePreview} avatar preview`}
                  fill
                  sizes="112px"
                  src={avatarPreview}
                />
              ) : (
                <span>{displayNamePreview.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className={styles.avatarControls}>
              <label className={styles.fileButton} htmlFor="profile-avatar">
                Choose image
              </label>
              <input
                accept={acceptedAvatarTypes}
                className={styles.visuallyHidden}
                id="profile-avatar"
                onChange={(event) => void handleAvatarSelection(event.target.files?.[0])}
                type="file"
              />
              {avatar.dataUrl ? (
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setAvatar(emptyAvatarDraft());
                    setAvatarError(null);
                  }}
                  type="button"
                >
                  Remove new image
                </button>
              ) : null}
              <p>JPEG, PNG or WebP. 2 MB maximum. 256-4096 pixels per side.</p>
              {avatar.fileName ? (
                <span>
                  {avatar.fileName} · {avatar.width}×{avatar.height}
                </span>
              ) : null}
            </div>
          </div>

          {avatarError ? (
            <p className={styles.fieldError} role="alert">
              {avatarError}
            </p>
          ) : null}
        </section>

        <section className={styles.panel} aria-labelledby="identity-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p>Public identity</p>
              <h2 id="identity-heading">Player details</h2>
            </div>
            <span>Validated before save</span>
          </div>

          <div className={styles.fieldGrid}>
            <label>
              <span>Display name</span>
              <input
                aria-invalid={Boolean(errors.displayName)}
                autoComplete="nickname"
                maxLength={32}
                {...register("displayName")}
              />
              {errors.displayName ? <small role="alert">{errors.displayName.message}</small> : null}
            </label>

            <label>
              <span>Player handle</span>
              <input
                aria-invalid={Boolean(errors.handle)}
                autoCapitalize="none"
                autoComplete="username"
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
                autoComplete="address-level2"
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
                autoCapitalize="characters"
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
            <p>Live preview</p>
            <h2 id="edit-preview-heading">{displayNamePreview}</h2>
            <span>{watchedFields.handle}</span>
          </div>
          <Badge tone="special" variant="soft">
            {watchedFields.availabilityState}
          </Badge>
          <p>{watchedFields.bio || "Your profile bio will appear here."}</p>
          <dl>
            <div>
              <dt>Location</dt>
              <dd>{watchedFields.locationLabel}</dd>
            </div>
            <div>
              <dt>Next window</dt>
              <dd>{watchedFields.nextWindowLabel}</dd>
            </div>
          </dl>
        </section>

        <div className={styles.statusRegion} aria-live="polite">
          {saveMessage ? <p className={styles.successMessage}>{saveMessage}</p> : null}
          {saveError ? <p className={styles.errorMessage}>{saveError}</p> : null}
        </div>

        <footer className={styles.actionBar}>
          <div>
            <button className={styles.secondaryButton} onClick={discardDraft} type="button">
              Discard draft
            </button>
            <button className={styles.ghostButton} onClick={restoreFoundationProfile} type="button">
              Restore original
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
            <button
              className={styles.primaryButton}
              disabled={isSubmitting || Boolean(avatarError)}
              type="submit"
            >
              {isSubmitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </footer>
      </form>

      <aside className={styles.stageNotice}>
        <strong>M11.3 development boundary</strong>
        <p>
          This stage persists a validated local development override. M11.4 replaces the local store
          with independent, schema-validated profile API resources without changing the form
          contract.
        </p>
      </aside>
    </main>
  );
}
