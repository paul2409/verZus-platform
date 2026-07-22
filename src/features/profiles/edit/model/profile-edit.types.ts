import type { PlayerAvailabilityState } from "../../foundation";

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

export type ProfileEditSnapshot = {
  version: number;
  updatedAt: string;
  avatarUrl: string | null;
  fields: ProfileEditFields;
  replayed: boolean;
};

export type ProfileEditDraft = {
  fields: ProfileEditFields;
  updatedAt: string;
};

export type ProfileEditApiErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};
