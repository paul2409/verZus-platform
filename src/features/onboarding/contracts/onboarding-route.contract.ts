// VERZUS M4 STEP 4.8

import type { OnboardingDraft, OnboardingStep } from "../model";

export const onboardingStepRoutes = {
  welcome: "/onboarding",
  games: "/onboarding/games",
  location: "/onboarding/location",
  identity: "/onboarding/identity",
  availability: "/onboarding/availability",
  crew: "/onboarding/crew",
  complete: "/onboarding/complete",
} as const satisfies Record<OnboardingStep, string>;

export const onboardingRouteSteps = Object.fromEntries(
  Object.entries(onboardingStepRoutes).map(([step, route]) => [route, step]),
) as Record<string, OnboardingStep>;

export function getOnboardingRoute(step: OnboardingStep): string {
  return onboardingStepRoutes[step];
}

export function getOnboardingStepFromPath(pathname: string): OnboardingStep | null {
  return onboardingRouteSteps[pathname] ?? null;
}

export function resolveOnboardingResumeRoute(draft: OnboardingDraft): string {
  if (draft.status === "completed") {
    return "/play";
  }

  return getOnboardingRoute(draft.currentStep);
}

export function isKnownOnboardingRoute(pathname: string): boolean {
  return getOnboardingStepFromPath(pathname) !== null;
}
