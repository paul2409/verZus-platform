// VERZUS M11.3 REPLAY-SAFE LOCAL DEVELOPMENT PROFILE STORE

"use client";

import { useEffect, useState } from "react";

import type { PlayerProfileViewModel } from "../../foundation";
import type {
  ProfileAvatarDraft,
  ProfileEditDraft,
  ProfileEditFields,
  ProfileEditRecord,
  ProfileEditSaveResult,
  ProfileEditSnapshot,
} from "../model/profile-edit.types";

const DRAFT_KEY = "verzus:m11:profile-edit:draft";
const CONFIRMED_KEY = "verzus:m11:profile-edit:confirmed";
const EVENT_NAME = "verzus:m11:profile-edit:changed";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function dispatchChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function stableFingerprint(fields: ProfileEditFields, avatar: ProfileAvatarDraft) {
  return JSON.stringify({
    fields,
    avatar: {
      dataUrl: avatar.dataUrl,
      fileName: avatar.fileName,
      mimeType: avatar.mimeType,
      sizeBytes: avatar.sizeBytes,
      width: avatar.width,
      height: avatar.height,
    },
  });
}

export function readProfileEditSnapshot(): ProfileEditSnapshot {
  return {
    draft: readJson<ProfileEditDraft>(DRAFT_KEY),
    confirmed: readJson<ProfileEditRecord>(CONFIRMED_KEY),
  };
}

export function saveProfileEditDraft(draft: ProfileEditDraft) {
  writeJson(DRAFT_KEY, draft);
  dispatchChange();
}

export function clearProfileEditDraft() {
  if (canUseStorage()) {
    window.localStorage.removeItem(DRAFT_KEY);
  }
  dispatchChange();
}

export function clearConfirmedProfileEdit() {
  if (canUseStorage()) {
    window.localStorage.removeItem(CONFIRMED_KEY);
    window.localStorage.removeItem(DRAFT_KEY);
  }
  dispatchChange();
}

export async function saveConfirmedProfileEdit(input: {
  fields: ProfileEditFields;
  avatar: ProfileAvatarDraft;
  requestKey: string;
}): Promise<ProfileEditSaveResult> {
  const fingerprint = stableFingerprint(input.fields, input.avatar);
  const current = readJson<ProfileEditRecord>(CONFIRMED_KEY);

  if (current?.requestKey === input.requestKey) {
    if (current.fingerprint !== fingerprint) {
      throw new Error("This save request key was already used for different profile data.");
    }
    return { record: current, replayed: true };
  }

  await new Promise((resolve) => window.setTimeout(resolve, 450));

  const now = new Date().toISOString();
  const record: ProfileEditRecord = {
    fields: input.fields,
    avatar: input.avatar,
    requestKey: input.requestKey,
    fingerprint,
    version: (current?.version ?? 0) + 1,
    updatedAt: now,
    savedAt: now,
  };

  writeJson(CONFIRMED_KEY, record);
  if (canUseStorage()) {
    window.localStorage.removeItem(DRAFT_KEY);
  }
  dispatchChange();

  return { record, replayed: false };
}

export function applyConfirmedProfileEdit(
  baseModel: PlayerProfileViewModel,
  confirmed: ProfileEditRecord | null,
): PlayerProfileViewModel {
  if (!confirmed) {
    return baseModel;
  }

  return {
    ...baseModel,
    identity: {
      ...baseModel.identity,
      displayName: confirmed.fields.displayName,
      handle: confirmed.fields.handle,
      title: confirmed.fields.title,
      bio: confirmed.fields.bio,
      locationLabel: confirmed.fields.locationLabel,
      countryCode: confirmed.fields.countryCode,
      avatarSrc: confirmed.avatar.dataUrl || baseModel.identity.avatarSrc,
      avatarAlt: `${confirmed.fields.displayName} player avatar`,
    },
    availability: {
      ...baseModel.availability,
      state: confirmed.fields.availabilityState,
      label: confirmed.fields.availabilityLabel,
      detail: confirmed.fields.availabilityDetail,
      nextWindowLabel: confirmed.fields.nextWindowLabel,
    },
  };
}

export function useConfirmedPlayerProfile(baseModel: PlayerProfileViewModel) {
  const [model, setModel] = useState(baseModel);

  useEffect(() => {
    const sync = () => {
      setModel(applyConfirmedProfileEdit(baseModel, readProfileEditSnapshot().confirmed));
    };

    sync();
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, [baseModel]);

  return model;
}
