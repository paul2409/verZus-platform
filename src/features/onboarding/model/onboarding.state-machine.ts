// VERZUS M4 STEP 4.7

import {
  onboardingDraftSchema,
  type OnboardingDraft,
  type OnboardingProgressUpdate,
  type OnboardingStep,
} from "./onboarding.schema";

export const requiredOnboardingSteps = [
  "welcome",
  "games",
  "location",
  "identity",
  "availability",
  "crew",
] as const satisfies readonly OnboardingStep[];

export type OnboardingMutationFailureCode =
  "step_out_of_order" | "onboarding_incomplete" | "already_completed";

export type OnboardingMutationResult =
  | {
      ok: true;
      draft: OnboardingDraft;
    }
  | {
      ok: false;
      code: OnboardingMutationFailureCode;
      message: string;
      fieldErrors: Record<string, string[]>;
    };

function uniqueSteps(steps: readonly OnboardingStep[]): OnboardingStep[] {
  return [...new Set(steps)];
}

export function createInitialOnboardingDraft(now = new Date()): OnboardingDraft {
  const timestamp = now.toISOString();

  return {
    version: 1,
    status: "not_started",
    currentStep: "welcome",
    completedSteps: [],
    selectedGameIds: [],
    location: null,
    playerIdentity: null,
    availability: [],
    crewChoice: null,
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
  };
}

export function getFirstIncompleteStep(draft: OnboardingDraft): OnboardingStep {
  const completed = new Set(draft.completedSteps);

  return requiredOnboardingSteps.find((step) => !completed.has(step)) ?? "complete";
}

export function getOnboardingProgressPercent(draft: OnboardingDraft): number {
  const completed = requiredOnboardingSteps.filter((step) =>
    draft.completedSteps.includes(step),
  ).length;

  return Math.round((completed / requiredOnboardingSteps.length) * 100);
}

function stepIndex(step: OnboardingStep): number {
  return requiredOnboardingSteps.indexOf(step as (typeof requiredOnboardingSteps)[number]);
}

function canSaveStep(draft: OnboardingDraft, requestedStep: OnboardingStep): boolean {
  const expectedStep = getFirstIncompleteStep(draft);
  const requestedIndex = stepIndex(requestedStep);
  const expectedIndex = stepIndex(expectedStep);

  if (requestedIndex === -1) {
    return false;
  }

  if (expectedStep === "complete") {
    return draft.completedSteps.includes(requestedStep);
  }

  return requestedIndex <= expectedIndex;
}

function applyUpdateData(
  draft: OnboardingDraft,
  update: OnboardingProgressUpdate,
): OnboardingDraft {
  switch (update.step) {
    case "welcome":
      return draft;
    case "games":
      return {
        ...draft,
        selectedGameIds: update.payload.selectedGameIds,
      };
    case "location":
      return {
        ...draft,
        location: update.payload,
      };
    case "identity":
      return {
        ...draft,
        playerIdentity: update.payload,
      };
    case "availability":
      return {
        ...draft,
        availability: update.payload.slots,
      };
    case "crew":
      return {
        ...draft,
        crewChoice: update.payload,
      };
  }
}

export function saveOnboardingProgress(
  draftInput: OnboardingDraft,
  update: OnboardingProgressUpdate,
  now = new Date(),
): OnboardingMutationResult {
  const draft = onboardingDraftSchema.parse(draftInput);

  if (draft.status === "completed") {
    return {
      ok: false,
      code: "already_completed",
      message: "Onboarding has already been completed.",
      fieldErrors: {},
    };
  }

  if (!canSaveStep(draft, update.step)) {
    return {
      ok: false,
      code: "step_out_of_order",
      message: "Complete the current onboarding step before moving ahead.",
      fieldErrors: {
        step: [`Continue from ${getFirstIncompleteStep(draft)}.`],
      },
    };
  }

  const withData = applyUpdateData(draft, update);
  const completedSteps = uniqueSteps([...withData.completedSteps, update.step]);
  const progressedDraft: OnboardingDraft = {
    ...withData,
    completedSteps,
    updatedAt: now.toISOString(),
    status: "in_progress",
  };
  const nextStep = getFirstIncompleteStep(progressedDraft);

  return {
    ok: true,
    draft: {
      ...progressedDraft,
      currentStep: nextStep,
      status: nextStep === "complete" ? "ready_to_complete" : "in_progress",
    },
  };
}

export function completeOnboarding(
  draftInput: OnboardingDraft,
  now = new Date(),
): OnboardingMutationResult {
  const draft = onboardingDraftSchema.parse(draftInput);

  if (draft.status === "completed") {
    return {
      ok: true,
      draft,
    };
  }

  const missingSteps = requiredOnboardingSteps.filter(
    (step) => !draft.completedSteps.includes(step),
  );

  if (missingSteps.length > 0) {
    return {
      ok: false,
      code: "onboarding_incomplete",
      message: "Complete every required onboarding step before finishing.",
      fieldErrors: {
        steps: missingSteps,
      },
    };
  }

  const timestamp = now.toISOString();

  return {
    ok: true,
    draft: {
      ...draft,
      status: "completed",
      currentStep: "complete",
      updatedAt: timestamp,
      completedAt: timestamp,
    },
  };
}
