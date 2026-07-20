// VERZUS M11.3 PROFILE EDIT TYPES

import type { PlayerAvailabilityState, PlayerProfileViewModel } from "../../foundation";

export type ProfileEditFields = {
  displayName: string;
  handle: string;
  title: string;
  bio: string;
  locationLabel: string;
  countryCode: string;
  availabilityState: PlayerAvailabilityState;
  availabilityLabel: string;
  availabilityDetail: string;
  nextWindowLabel: string;
};

export type ProfileAvatarDraft = {
  dataUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
};

export type ProfileEditDraft = {
  fields: ProfileEditFields;
  avatar: ProfileAvatarDraft;
  updatedAt: string;
};

export type ProfileEditRecord = ProfileEditDraft & {
  version: number;
  requestKey: string;
  fingerprint: string;
  savedAt: string;
};

export type ProfileEditSaveResult = {
  record: ProfileEditRecord;
  replayed: boolean;
};

export type ProfileEditSnapshot = {
  draft: ProfileEditDraft | null;
  confirmed: ProfileEditRecord | null;
};

export function profileFieldsFromModel(model: PlayerProfileViewModel): ProfileEditFields {
  return {
    displayName: model.identity.displayName,
    handle: model.identity.handle,
    title: model.identity.title,
    bio: model.identity.bio,
    locationLabel: model.identity.locationLabel,
    countryCode: model.identity.countryCode,
    availabilityState: model.availability.state,
    availabilityLabel: model.availability.label,
    availabilityDetail: model.availability.detail,
    nextWindowLabel: model.availability.nextWindowLabel,
  };
}

export function emptyAvatarDraft(): ProfileAvatarDraft {
  return {
    dataUrl: null,
    fileName: null,
    mimeType: null,
    sizeBytes: null,
    width: null,
    height: null,
  };
}
