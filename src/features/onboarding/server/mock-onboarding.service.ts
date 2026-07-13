// VERZUS M4 STEP 4.7

import type { OnboardingApiFailure, OnboardingProgressSuccess } from "../api";
import {
  completeOnboarding,
  saveOnboardingProgress,
  type OnboardingDraft,
  type OnboardingProgressUpdate,
} from "../model";
import { decodeMockOnboardingDraft, encodeMockOnboardingDraft } from "./mock-onboarding.cookie";

export type MockOnboardingServiceResult =
  | {
      status: number;
      body: OnboardingProgressSuccess;
      cookieValue: string;
      completed: boolean;
    }
  | {
      status: number;
      body: OnboardingApiFailure;
      cookieValue: null;
      completed: false;
    };

function requestId(): string {
  return `mock-onboarding-${globalThis.crypto.randomUUID()}`;
}

function success(draft: OnboardingDraft): MockOnboardingServiceResult {
  return {
    status: 200,
    body: {
      ok: true,
      data: draft,
      requestId: requestId(),
    },
    cookieValue: encodeMockOnboardingDraft(draft),
    completed: draft.status === "completed",
  };
}

function failure(
  status: number,
  code: string,
  message: string,
  fieldErrors: Record<string, string[]> = {},
): MockOnboardingServiceResult {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message,
        requestId: requestId(),
        retryable: false,
        fieldErrors,
      },
    },
    cookieValue: null,
    completed: false,
  };
}

export function getMockOnboardingProgress(cookieValue: string | null): MockOnboardingServiceResult {
  return success(decodeMockOnboardingDraft(cookieValue));
}

export function updateMockOnboardingProgress(
  cookieValue: string | null,
  update: OnboardingProgressUpdate,
): MockOnboardingServiceResult {
  const current = decodeMockOnboardingDraft(cookieValue);
  const result = saveOnboardingProgress(current, update);

  if (!result.ok) {
    return failure(409, result.code, result.message, result.fieldErrors);
  }

  return success(result.draft);
}

export function completeMockOnboardingProgress(
  cookieValue: string | null,
): MockOnboardingServiceResult {
  const current = decodeMockOnboardingDraft(cookieValue);
  const result = completeOnboarding(current);

  if (!result.ok) {
    return failure(409, result.code, result.message, result.fieldErrors);
  }

  return success(result.draft);
}
