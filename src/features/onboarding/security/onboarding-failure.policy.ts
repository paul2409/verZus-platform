// VERZUS M4 STEP 4.10

import type { OnboardingOptionMeta } from "../api/onboarding-options.schema";
import type { AppFailure } from "../../../shared/failures";

export type OnboardingResourceState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "maintenance"
  | "partial_failure";

export interface ResolveOnboardingResourceStateInput {
  loading: boolean;
  retrying: boolean;
  stale: boolean;
  itemCount: number;
  meta: OnboardingOptionMeta | null;
  failure: AppFailure | null;
}

export interface OnboardingFailureDisplayModel {
  state: OnboardingResourceState;
  title: string;
  message: string;
  retryable: boolean;
  preserveDraft: boolean;
  survivingActions: readonly string[];
}

export function resolveOnboardingResourceState(
  input: ResolveOnboardingResourceStateInput,
): OnboardingResourceState {
  if (input.loading) {
    return "loading";
  }

  if (input.retrying) {
    return "retrying";
  }

  if (input.failure) {
    switch (input.failure.code) {
      case "offline":
        return "offline";
      case "maintenance":
        return "maintenance";
      case "unauthorized":
      case "session_refresh_failed":
        return "unauthorized";
      case "forbidden":
      case "suspended":
      case "banned":
        return "forbidden";
      case "partial_failure":
        return "partial_failure";
      default:
        return "error";
    }
  }

  if (input.meta?.status === "partial") {
    return "partial_failure";
  }

  if (input.stale) {
    return "stale";
  }

  if (input.itemCount === 0) {
    return "empty";
  }

  return "success";
}

export function resolveOnboardingFailureDisplay(
  failure: AppFailure,
): OnboardingFailureDisplayModel {
  const state = resolveOnboardingResourceState({
    loading: false,
    retrying: false,
    stale: false,
    itemCount: 0,
    meta: null,
    failure,
  });

  switch (state) {
    case "offline":
      return {
        state,
        title: "You are offline",
        message: failure.message,
        retryable: true,
        preserveDraft: true,
        survivingActions: ["Return to the previous completed step", "Retry when online"],
      };

    case "maintenance":
      return {
        state,
        title: "Onboarding temporarily unavailable",
        message: failure.message,
        retryable: true,
        preserveDraft: true,
        survivingActions: ["Return to the previous completed step", "Retry later"],
      };

    case "partial_failure":
      return {
        state,
        title: "Some options are unavailable",
        message: failure.message,
        retryable: true,
        preserveDraft: true,
        survivingActions: [
          "Use available options",
          "Retry the failed widget",
          "Return to the previous completed step",
        ],
      };

    case "unauthorized":
      return {
        state,
        title: "Session expired",
        message: failure.message,
        retryable: false,
        preserveDraft: true,
        survivingActions: ["Sign in again"],
      };

    case "forbidden":
      return {
        state,
        title: "Onboarding access blocked",
        message: failure.message,
        retryable: false,
        preserveDraft: true,
        survivingActions: ["View account status"],
      };

    default:
      return {
        state: "error",
        title: "Onboarding could not continue",
        message: failure.message,
        retryable: failure.retryable,
        preserveDraft: true,
        survivingActions: failure.retryable
          ? ["Retry the failed widget", "Return to the previous completed step"]
          : ["Return to the previous completed step"],
      };
  }
}
