import "server-only";

import { randomUUID } from "node:crypto";

import type {
  OnboardingApiFailure,
  OnboardingApiResponse,
  OnboardingProgressSuccess,
} from "../api";
import {
  completeOnboarding,
  createInitialOnboardingDraft,
  saveOnboardingProgress,
  type OnboardingDraft,
  type OnboardingProgressUpdate,
} from "../model";
import { readRuntimeSession } from "@/lib/session/runtime-session.server";
import {
  completePlayerIdentity,
  getUserGamerTag,
  readOnboardingDraft,
  writeOnboardingDraft,
} from "./onboarding.repository";

export interface OnboardingResult {
  status: number;
  body: OnboardingApiResponse;
}

function requestId(): string {
  return `onboarding-${randomUUID()}`;
}

function success(draft: OnboardingDraft, id = requestId()): OnboardingResult {
  const body: OnboardingProgressSuccess = { ok: true, data: draft, requestId: id };
  return { status: 200, body };
}

function failure(
  status: number,
  code: string,
  message: string,
  fieldErrors: Record<string, string[]> = {},
): OnboardingResult {
  const body: OnboardingApiFailure = {
    ok: false,
    error: { code, message, requestId: requestId(), retryable: status >= 500, fieldErrors },
  };
  return { status, body };
}

export async function resolveOnboardingUser(
  rawToken: string | null,
): Promise<{ userId: string; gamerTag: string } | OnboardingResult> {
  const session = await readRuntimeSession(rawToken);
  if (!session.user) return failure(401, "unauthorized", "Sign in before accessing onboarding.");
  if (session.state === "suspended" || session.state === "banned") {
    return failure(403, "forbidden", "This account cannot access onboarding.");
  }
  if (!session.user.emailVerified) {
    return failure(403, "email_unverified", "Verify your email before onboarding.");
  }
  const gamerTag = await getUserGamerTag(session.user.id);
  if (!gamerTag) return failure(404, "user_not_found", "The signed-in account no longer exists.");
  return { userId: session.user.id, gamerTag };
}

export async function getProductionOnboardingProgress(
  rawToken: string | null,
): Promise<OnboardingResult> {
  const user = await resolveOnboardingUser(rawToken);
  if ("status" in user) return user;
  const existing = await readOnboardingDraft(user.userId);
  if (existing) return success(existing);
  const draft = createInitialOnboardingDraft();
  await writeOnboardingDraft({
    userId: user.userId,
    draft,
    requestId: requestId(),
    action: "onboarding.started",
  });
  return success(draft);
}

export async function updateProductionOnboardingProgress(
  rawToken: string | null,
  update: OnboardingProgressUpdate,
): Promise<OnboardingResult> {
  const user = await resolveOnboardingUser(rawToken);
  if ("status" in user) return user;
  const current = (await readOnboardingDraft(user.userId)) ?? createInitialOnboardingDraft();

  if (update.step === "games") {
    const invalid = update.payload.selectedGameIds.filter((id) => id !== "ea-sports-fc");
    if (invalid.length > 0)
      return failure(400, "unsupported_game", "Choose a currently supported game.", {
        selectedGameIds: invalid,
      });
  }
  if (update.step === "crew" && update.payload.decision === "join") {
    return failure(
      409,
      "crew_unavailable",
      "Crew joining is not available until the Crew service is connected.",
    );
  }
  const normalizedUpdate =
    update.step === "identity"
      ? { ...update, payload: { ...update.payload, gamerTag: user.gamerTag } }
      : update;
  const mutation = saveOnboardingProgress(current, normalizedUpdate);
  if (!mutation.ok) return failure(409, mutation.code, mutation.message, mutation.fieldErrors);

  await writeOnboardingDraft({
    userId: user.userId,
    draft: mutation.draft,
    requestId: requestId(),
    action: `onboarding.${update.step}_saved`,
  });
  return success(mutation.draft);
}

export async function completeProductionOnboarding(
  rawToken: string | null,
): Promise<OnboardingResult> {
  const user = await resolveOnboardingUser(rawToken);
  if ("status" in user) return user;
  const current = await readOnboardingDraft(user.userId);
  if (!current)
    return failure(409, "onboarding_incomplete", "Start onboarding before completing it.");
  const mutation = completeOnboarding(current);
  if (!mutation.ok) return failure(409, mutation.code, mutation.message, mutation.fieldErrors);
  if (mutation.draft.crewChoice?.decision === "join") {
    return failure(
      409,
      "crew_unavailable",
      "Skip Crew selection until the Crew service is connected.",
    );
  }
  await completePlayerIdentity({
    userId: user.userId,
    draft: mutation.draft,
    requestId: requestId(),
  });
  return success(mutation.draft);
}
