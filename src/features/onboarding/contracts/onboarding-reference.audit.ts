// VERZUS M4 STEP 4.8

import type { OnboardingStep } from "../model";

export const referenceStatusValues = [
  "missing",
  "generated_unapproved",
  "approved",
  "blocked",
  "not_required",
] as const;

export type ReferenceStatus = (typeof referenceStatusValues)[number];

export type ReferenceViewport = "mobile390" | "tablet768" | "desktop1440";

export interface ReferenceViewportAudit {
  status: ReferenceStatus;
  note: string;
}

export interface OnboardingReferenceAuditEntry {
  step: OnboardingStep;
  mobile390: ReferenceViewportAudit;
  tablet768: ReferenceViewportAudit;
  desktop1440: ReferenceViewportAudit;
}

const blockedTablet: ReferenceViewportAudit = {
  status: "blocked",
  note: "Tablet reference is blocked until the 390px mobile reference is approved and tablet is confirmed necessary.",
};

const blockedDesktop: ReferenceViewportAudit = {
  status: "blocked",
  note: "Desktop reference is blocked until the mobile reference is approved.",
};

export const onboardingReferenceAudit = {
  welcome: {
    step: "welcome",
    mobile390: {
      status: "generated_unapproved",
      note: "A 390px concept exists, but formal approval has not been recorded.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  games: {
    step: "games",
    mobile390: {
      status: "generated_unapproved",
      note: "A 390px concept exists, but formal approval has not been recorded.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  location: {
    step: "location",
    mobile390: {
      status: "generated_unapproved",
      note: "A 390px concept exists, but formal approval has not been recorded.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  identity: {
    step: "identity",
    mobile390: {
      status: "generated_unapproved",
      note: "A 390px concept exists, but formal approval has not been recorded.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  availability: {
    step: "availability",
    mobile390: {
      status: "missing",
      note: "The required 390px mobile reference has not been generated.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  crew: {
    step: "crew",
    mobile390: {
      status: "missing",
      note: "The required 390px mobile reference has not been generated.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
  complete: {
    step: "complete",
    mobile390: {
      status: "missing",
      note: "The required 390px mobile reference has not been generated.",
    },
    tablet768: blockedTablet,
    desktop1440: blockedDesktop,
  },
} as const satisfies Record<OnboardingStep, OnboardingReferenceAuditEntry>;

export interface ReferenceGap {
  step: OnboardingStep;
  viewport: ReferenceViewport;
  status: ReferenceStatus;
  note: string;
}

export function getOnboardingReferenceGaps(): ReferenceGap[] {
  const viewports: readonly ReferenceViewport[] = ["mobile390", "tablet768", "desktop1440"];

  return Object.values(onboardingReferenceAudit).flatMap((entry) =>
    viewports.flatMap((viewport) => {
      const audit = entry[viewport];

      if (audit.status === "approved" || audit.status === "not_required") {
        return [];
      }

      return [
        {
          step: entry.step,
          viewport,
          status: audit.status,
          note: audit.note,
        },
      ];
    }),
  );
}

function isApprovedReference(status: ReferenceStatus): boolean {
  return status === "approved";
}

function isApprovedOrNotRequiredReference(status: ReferenceStatus): boolean {
  return status === "approved" || status === "not_required";
}

export function canImplementFinalOnboardingScreen(step: OnboardingStep): boolean {
  const audit = onboardingReferenceAudit[step];

  return (
    isApprovedReference(audit.mobile390.status) &&
    isApprovedOrNotRequiredReference(audit.tablet768.status) &&
    isApprovedReference(audit.desktop1440.status)
  );
}
