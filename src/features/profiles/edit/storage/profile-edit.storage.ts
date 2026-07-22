"use client";

import type { ProfileEditDraft } from "../model/profile-edit.types";

const DRAFT_KEY = "verzus:profile-edit:draft";

export function readProfileEditDraft(): ProfileEditDraft | null {
  try {
    const value = window.localStorage.getItem(DRAFT_KEY);
    return value ? (JSON.parse(value) as ProfileEditDraft) : null;
  } catch {
    return null;
  }
}

export function saveProfileEditDraft(draft: ProfileEditDraft): void {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearProfileEditDraft(): void {
  window.localStorage.removeItem(DRAFT_KEY);
}
