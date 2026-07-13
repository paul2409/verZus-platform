// VERZUS M4 STEP 4.5

export const mockAuthScenarios = {
  authenticated: {
    identifier: "player@example.com",
    password: "StrongPass1!",
  },
  emailUnverified: {
    identifier: "unverified@example.com",
    password: "StrongPass1!",
  },
  onboardingIncomplete: {
    identifier: "onboarding@example.com",
    password: "StrongPass1!",
  },
  suspended: {
    identifier: "suspended@example.com",
    password: "StrongPass1!",
  },
  banned: {
    identifier: "banned@example.com",
    password: "StrongPass1!",
  },
  invalidCredentials: {
    identifier: "player@example.com",
    password: "WrongPass1!",
  },
  rateLimited: {
    identifier: "rate-limit@example.com",
    password: "StrongPass1!",
  },
  duplicateRegistrationEmail: "existing@example.com",
  validVerificationCode: "123456",
  expiredVerificationCode: "000000",
  rateLimitedVerificationCode: "999999",
  expiredResetToken: "expired-reset-token-value",
} as const;
