// VERZUS M4 STEP 4.7

import { Buffer } from "node:buffer";

import {
  createInitialOnboardingDraft,
  onboardingDraftSchema,
  type OnboardingDraft,
} from "../model";

export const MOCK_ONBOARDING_COOKIE = "verzus_mock_onboarding";

export function encodeMockOnboardingDraft(draft: OnboardingDraft): string {
  const validated = onboardingDraftSchema.parse(draft);

  return Buffer.from(JSON.stringify(validated), "utf8").toString("base64url");
}

export function decodeMockOnboardingDraft(value: string | null | undefined): OnboardingDraft {
  if (!value) {
    return createInitialOnboardingDraft();
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);

    return onboardingDraftSchema.parse(parsed);
  } catch {
    return createInitialOnboardingDraft();
  }
}
