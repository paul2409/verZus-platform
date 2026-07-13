// VERZUS M4 STEP 4.9

import type { OnboardingDraft, OnboardingProgressUpdate } from "../model";
import { onboardingProgressRequestSchema } from "./onboarding-api.schema";
import {
  adaptOnboardingProgressPayload,
  OnboardingApiClientError,
} from "./onboarding-progress.adapter";

export { OnboardingApiClientError };

async function parseResponse(response: Response): Promise<OnboardingDraft> {
  const payload: unknown = await response.json();

  return adaptOnboardingProgressPayload(payload);
}

export async function getOnboardingProgress(): Promise<OnboardingDraft> {
  const response = await fetch("/api/onboarding/progress", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  return parseResponse(response);
}

export async function saveOnboardingProgressRequest(
  update: OnboardingProgressUpdate,
): Promise<OnboardingDraft> {
  const validated = onboardingProgressRequestSchema.parse(update);
  const response = await fetch("/api/onboarding/progress", {
    method: "PUT",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(validated),
  });

  return parseResponse(response);
}

export async function finishOnboarding(): Promise<OnboardingDraft> {
  const response = await fetch("/api/onboarding/complete", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  return parseResponse(response);
}
