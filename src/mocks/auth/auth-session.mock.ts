// VERZUS M4 STEP 4.1

import type { AuthSessionResponse } from "../../features/auth";

const expiresAt = "2026-07-13T12:00:00.000Z";

export const authenticatedSessionMock: AuthSessionResponse = {
  state: "authenticated",
  user: {
    id: "player-jayflex",
    email: "jayflex@example.com",
    phone: null,
    role: "player",
    emailVerified: true,
    onboardingComplete: true,
  },
  session: {
    id: "session-authenticated",
    expiresAt,
    refreshable: true,
    deviceId: "device-local",
  },
  restrictionReason: null,
  requestId: "mock-authenticated-request",
};

export const unverifiedSessionMock: AuthSessionResponse = {
  state: "email_unverified",
  user: {
    id: "player-new",
    email: "new-player@example.com",
    phone: null,
    role: "player",
    emailVerified: false,
    onboardingComplete: false,
  },
  session: {
    id: "session-unverified",
    expiresAt,
    refreshable: true,
    deviceId: "device-local",
  },
  restrictionReason: null,
  requestId: "mock-unverified-request",
};

export const onboardingSessionMock: AuthSessionResponse = {
  state: "onboarding_incomplete",
  user: {
    id: "player-onboarding",
    email: "onboarding@example.com",
    phone: null,
    role: "player",
    emailVerified: true,
    onboardingComplete: false,
  },
  session: {
    id: "session-onboarding",
    expiresAt,
    refreshable: true,
    deviceId: "device-local",
  },
  restrictionReason: null,
  requestId: "mock-onboarding-request",
};

export const expiredSessionMock: AuthSessionResponse = {
  state: "session_expired",
  user: null,
  session: null,
  restrictionReason: null,
  requestId: "mock-expired-request",
};
