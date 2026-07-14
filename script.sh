#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS M4 - Build and verify all 15 production screens"
echo "This preserves the 8 existing authentication/account screens,"
echo "builds the 7 production onboarding screens, and verifies every M4 route."
echo "No branch will be created or changed."
echo

ROOT_MARKER="package.json"
FEATURE_ROOT="src/features/onboarding"
UI_DIR="$FEATURE_ROOT/ui"
ROUTE_ROOT="src/app/(onboarding)"
DOC_FILE="docs/milestones/M4/onboarding-production-routes.md"
PACKAGE_FILE="package.json"

echo "Auditing the eight existing authentication and account routes..."

node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.join(process.cwd(), "src", "app");

const requiredAuthRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/account/suspended",
  "/account/banned",
];

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(absolute);
    }

    return entry.isFile() ? [absolute] : [];
  });
}

function toRoute(file) {
  const relative = path
    .relative(appRoot, file)
    .split(path.sep);

  if (relative.at(-1) !== "page.tsx") {
    return null;
  }

  const segments = relative
    .slice(0, -1)
    .filter(
      (segment) =>
        !(
          segment.startsWith("(") &&
          segment.endsWith(")")
        ),
    )
    .filter((segment) => !segment.startsWith("@"));

  return segments.length === 0
    ? "/"
    : `/${segments.join("/")}`;
}

const discovered = new Map();

for (const file of walk(appRoot)) {
  const route = toRoute(file);

  if (route) {
    discovered.set(
      route,
      path.relative(process.cwd(), file),
    );
  }
}

const missing = requiredAuthRoutes.filter(
  (route) => !discovered.has(route),
);

for (const route of requiredAuthRoutes) {
  const file = discovered.get(route);

  console.log(
    `${file ? "FOUND  " : "MISSING"} ${route}${
      file ? ` ${file}` : ""
    }`,
  );
}

if (missing.length > 0) {
  console.error();
  console.error(
    "The all-screen installer will not replace missing authentication screens.",
  );
  console.error(
    "Restore or complete these routes before continuing:",
  );

  for (const route of missing) {
    console.error(`  ${route}`);
  }

  process.exit(1);
}

console.log();
console.log(
  "Authentication/account route prerequisite passed: 8 of 8 found.",
);
NODE

required_files=(
  "$ROOT_MARKER"
  "$FEATURE_ROOT/api/onboarding-api.client.ts"
  "$FEATURE_ROOT/api/onboarding-options.client.ts"
  "$FEATURE_ROOT/contracts/onboarding-route.contract.ts"
  "$FEATURE_ROOT/model/onboarding.schema.ts"
  "$FEATURE_ROOT/model/onboarding.state-machine.ts"
  "src/app/providers.tsx"
  "src/proxy.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: prerequisite file not found: $file"
    echo "Run this script from the VERZUS repository root after M4 Steps 4.7-4.10."
    exit 1
  fi
done

owned_files=(
  "$UI_DIR/OnboardingExperience.tsx"
  "$UI_DIR/onboarding-experience.module.css"
  "$UI_DIR/onboarding-route-access.ts"
  "$UI_DIR/onboarding-route-access.test.ts"
  "$UI_DIR/index.ts"
  "$ROUTE_ROOT/layout.tsx"
  "$ROUTE_ROOT/onboarding/page.tsx"
  "$ROUTE_ROOT/onboarding/games/page.tsx"
  "$ROUTE_ROOT/onboarding/location/page.tsx"
  "$ROUTE_ROOT/onboarding/identity/page.tsx"
  "$ROUTE_ROOT/onboarding/availability/page.tsx"
  "$ROUTE_ROOT/onboarding/crew/page.tsx"
  "$ROUTE_ROOT/onboarding/complete/page.tsx"
  "$DOC_FILE"
)

for file in "${owned_files[@]}"; do
  if [[ -f "$file" ]] && ! grep -q "VERZUS M4 PRODUCTION ONBOARDING ROUTES" "$file"; then
    echo "Error: refusing to overwrite an unrelated file:"
    echo "  $file"
    exit 1
  fi
done

mkdir -p \
  "$UI_DIR" \
  "$ROUTE_ROOT/onboarding/games" \
  "$ROUTE_ROOT/onboarding/location" \
  "$ROUTE_ROOT/onboarding/identity" \
  "$ROUTE_ROOT/onboarding/availability" \
  "$ROUTE_ROOT/onboarding/crew" \
  "$ROUTE_ROOT/onboarding/complete" \
  "docs/milestones/M4"

cat > "$UI_DIR/onboarding-route-access.ts" <<'EOF'
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import {
  getOnboardingRoute,
  type OnboardingDraft,
  type OnboardingStep,
} from "@/features/onboarding";

const stepOrder = [
  "welcome",
  "games",
  "location",
  "identity",
  "availability",
  "crew",
  "complete",
] as const satisfies readonly OnboardingStep[];

function indexOfStep(step: OnboardingStep): number {
  return stepOrder.indexOf(step);
}

export function resolveOnboardingRouteRedirect(
  draft: OnboardingDraft,
  requestedStep: OnboardingStep,
): string | null {
  if (draft.status === "completed") {
    return "/play";
  }

  if (requestedStep === "complete" && draft.currentStep !== "complete") {
    return getOnboardingRoute(draft.currentStep);
  }

  const requestedIndex = indexOfStep(requestedStep);
  const currentIndex = indexOfStep(draft.currentStep);
  const alreadyCompleted = draft.completedSteps.includes(requestedStep);

  if (requestedIndex > currentIndex && !alreadyCompleted) {
    return getOnboardingRoute(draft.currentStep);
  }

  return null;
}
EOF

cat > "$UI_DIR/onboarding-route-access.test.ts" <<'EOF'
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import { describe, expect, it } from "vitest";

import {
  createInitialOnboardingDraft,
  saveOnboardingProgress,
} from "@/features/onboarding";

import { resolveOnboardingRouteRedirect } from "./onboarding-route-access";

describe("resolveOnboardingRouteRedirect", () => {
  it("keeps the player on the current onboarding step", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "welcome")).toBeNull();
  });

  it("blocks a future step and returns the resumable route", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "identity")).toBe(
      "/onboarding",
    );
  });

  it("allows a previously completed step to be revisited", () => {
    const initial = createInitialOnboardingDraft();
    const saved = saveOnboardingProgress(initial, {
      step: "welcome",
      payload: { acknowledged: true },
    });

    expect(saved.ok).toBe(true);

    if (!saved.ok) {
      return;
    }

    expect(
      resolveOnboardingRouteRedirect(saved.draft, "welcome"),
    ).toBeNull();
  });

  it("blocks completion until the draft is ready", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "complete")).toBe(
      "/onboarding",
    );
  });

  it("sends completed players to Play", () => {
    const draft = {
      ...createInitialOnboardingDraft(),
      status: "completed" as const,
      currentStep: "complete" as const,
      completedAt: "2026-07-14T00:00:00.000Z",
    };

    expect(resolveOnboardingRouteRedirect(draft, "complete")).toBe(
      "/play",
    );
  });
});
EOF

cat > "$UI_DIR/index.ts" <<'EOF'
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

export { OnboardingExperience } from "./OnboardingExperience";
export { resolveOnboardingRouteRedirect } from "./onboarding-route-access";
EOF

cat > "$UI_DIR/OnboardingExperience.tsx" <<'EOF'
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  finishOnboarding,
  getOnboardingAvailabilityOptions,
  getOnboardingCrewOptions,
  getOnboardingGameOptions,
  getOnboardingIdentityOptions,
  getOnboardingLocationOptions,
  getOnboardingProgress,
  getOnboardingProgressPercent,
  getOnboardingRoute,
  OnboardingApiClientError,
  saveOnboardingProgressRequest,
  type AvailabilitySlot,
  type CrewChoice,
  type OnboardingDraft,
  type OnboardingOptionMeta,
  type OnboardingProgressUpdate,
  type OnboardingStep,
  type PlayerIdentityInput,
} from "@/features/onboarding";

import { resolveOnboardingRouteRedirect } from "./onboarding-route-access";
import styles from "./onboarding-experience.module.css";

const progressQueryKey = ["onboarding", "progress"] as const;

const stepDetails = {
  welcome: {
    label: "Welcome",
    eyebrow: "YOUR COMPETITIVE IDENTITY STARTS HERE",
    title: "Build your player profile.",
    description:
      "Set up the essentials VERZUS needs to match you with the right games, opponents, opportunities, and Crew.",
  },
  games: {
    label: "Games",
    eyebrow: "BUILD YOUR COMPETITIVE POOL",
    title: "What do you play?",
    description:
      "Choose every game you want to compete in. You can update these selections later.",
  },
  location: {
    label: "Location",
    eyebrow: "COMPETE IN THE RIGHT REGION",
    title: "Where are you based?",
    description:
      "Location improves match timing, latency, event eligibility, and local competition.",
  },
  identity: {
    label: "Identity",
    eyebrow: "CLAIM YOUR PLAYER IDENTITY",
    title: "How should players know you?",
    description:
      "Create the identity shown in rankings, matches, Crew activity, and your public player card.",
  },
  availability: {
    label: "Availability",
    eyebrow: "MAKE EVERY MATCH COUNT",
    title: "When can you compete?",
    description:
      "Set your usual local-time availability. Match offers will prioritize these windows.",
  },
  crew: {
    label: "Crew",
    eyebrow: "COMPETE BETTER TOGETHER",
    title: "Find your Crew.",
    description:
      "Join a compatible competitive group now or skip and decide after exploring VERZUS.",
  },
  complete: {
    label: "Complete",
    eyebrow: "SETUP COMPLETE",
    title: "You are match ready.",
    description:
      "Your competitive identity is ready. Enter Play to see your next action, ranking, Crew activity, and opportunities.",
  },
} as const satisfies Record<
  OnboardingStep,
  {
    label: string;
    eyebrow: string;
    title: string;
    description: string;
  }
>;

const stepOrder = [
  "welcome",
  "games",
  "location",
  "identity",
  "availability",
  "crew",
  "complete",
] as const satisfies readonly OnboardingStep[];

const previousSteps = {
  welcome: null,
  games: "welcome",
  location: "games",
  identity: "location",
  availability: "identity",
  crew: "availability",
  complete: "crew",
} as const satisfies Record<OnboardingStep, OnboardingStep | null>;

type ErrorView = {
  state: "error" | "offline" | "unauthorized" | "forbidden" | "maintenance";
  title: string;
  message: string;
  retryable: boolean;
  destination: string | null;
  destinationLabel: string | null;
};

function getErrorView(error: unknown): ErrorView {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      state: "offline",
      title: "You are offline",
      message:
        "Your saved onboarding progress is protected. Reconnect and retry this step.",
      retryable: true,
      destination: null,
      destinationLabel: null,
    };
  }

  if (error instanceof OnboardingApiClientError) {
    if (
      error.code === "unauthorized" ||
      error.code === "session_expired" ||
      error.code === "session_refresh_failed"
    ) {
      return {
        state: "unauthorized",
        title: "Session expired",
        message: error.message,
        retryable: false,
        destination: "/session-expired",
        destinationLabel: "Restore session",
      };
    }

    if (
      error.code === "forbidden" ||
      error.code === "suspended" ||
      error.code === "banned"
    ) {
      return {
        state: "forbidden",
        title: "Onboarding access blocked",
        message: error.message,
        retryable: false,
        destination: "/account/suspended",
        destinationLabel: "View account status",
      };
    }

    if (
      error.code === "maintenance" ||
      error.code === "service_unavailable"
    ) {
      return {
        state: "maintenance",
        title: "Onboarding is temporarily unavailable",
        message: error.message,
        retryable: error.retryable,
        destination: null,
        destinationLabel: null,
      };
    }

    return {
      state: "error",
      title: "Onboarding could not continue",
      message: error.message,
      retryable: error.retryable,
      destination: null,
      destinationLabel: null,
    };
  }

  return {
    state: "error",
    title: "Onboarding could not continue",
    message:
      error instanceof Error
        ? error.message
        : "An unexpected onboarding error occurred.",
    retryable: true,
    destination: null,
    destinationLabel: null,
  };
}

function useOnlineState(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark}>V</span>
      <span className={styles.brandCopy}>
        <strong>VERZUS</strong>
        <small>COMPETE. RISE. BELONG.</small>
      </span>
    </div>
  );
}

function Progress({ draft }: { draft: OnboardingDraft }) {
  const percent = getOnboardingProgressPercent(draft);

  return (
    <div className={styles.progress} aria-label={`${percent}% complete`}>
      <div className={styles.progressMeta}>
        <span>PLAYER SETUP</span>
        <strong>{percent}%</strong>
      </div>
      <div className={styles.progressTrack}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function StepRail({
  currentStep,
  draft,
}: {
  currentStep: OnboardingStep;
  draft: OnboardingDraft;
}) {
  return (
    <aside className={styles.stepRail} aria-label="Onboarding progress">
      <Brand />

      <nav className={styles.railSteps}>
        {stepOrder.map((step, index) => {
          const active = step === currentStep;
          const complete = draft.completedSteps.includes(step);
          const accessible =
            complete || step === draft.currentStep || step === "welcome";
          const content = (
            <>
              <span className={styles.railNumber}>
                {complete ? "✓" : index + 1}
              </span>
              <span className={styles.railCopy}>
                <strong>{stepDetails[step].label}</strong>
                <small>
                  {active ? "Current step" : complete ? "Complete" : "Upcoming"}
                </small>
              </span>
            </>
          );

          if (accessible) {
            return (
              <Link
                key={step}
                href={getOnboardingRoute(step)}
                className={`${styles.railStep} ${
                  active ? styles.railStepActive : ""
                } ${complete ? styles.railStepComplete : ""}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={step}
              className={styles.railStep}
              aria-disabled="true"
            >
              {content}
            </div>
          );
        })}
      </nav>

      <div className={styles.saveNotice}>
        <span>LIVE SAVE</span>
        <p>Progress is saved after every validated step.</p>
      </div>
    </aside>
  );
}

function ScreenHeading({ step }: { step: OnboardingStep }) {
  const details = stepDetails[step];

  return (
    <header className={styles.screenHeading}>
      <span>{details.eyebrow}</span>
      <h1>{details.title}</h1>
      <p>{details.description}</p>
    </header>
  );
}

function StatePanel({
  state,
  title,
  message,
  retry,
  destination,
  destinationLabel,
}: {
  state: string;
  title: string;
  message: string;
  retry?: (() => void) | undefined;
  destination?: string | null | undefined;
  destinationLabel?: string | null | undefined;
}) {
  return (
    <section className={styles.statePanel} data-state={state} aria-live="polite">
      <span>{state.replaceAll("_", " ").toUpperCase()}</span>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className={styles.stateActions}>
        {retry ? (
          <button type="button" onClick={retry}>
            Retry
          </button>
        ) : null}
        {destination && destinationLabel ? (
          <Link href={destination}>{destinationLabel}</Link>
        ) : null}
      </div>
    </section>
  );
}

function MetaNotice({ meta }: { meta: OnboardingOptionMeta }) {
  if (meta.status !== "partial") {
    return null;
  }

  return (
    <section className={styles.partialNotice} aria-live="polite">
      <strong>Some options are temporarily unavailable.</strong>
      {meta.warnings.map((warning) => (
        <p key={`${warning.source}-${warning.message}`}>{warning.message}</p>
      ))}
    </section>
  );
}

function MutationError({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }

  const view = getErrorView(error);

  return (
    <div className={styles.mutationError} role="alert">
      <strong>{view.title}</strong>
      <span>{view.message}</span>
    </div>
  );
}

function PrimaryButton({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.primaryButton}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      <span aria-hidden="true">›</span>
    </button>
  );
}

function StepFooter({
  step,
  children,
  saving,
}: {
  step: OnboardingStep;
  children: ReactNode;
  saving: boolean;
}) {
  const previousStep = previousSteps[step];

  return (
    <footer className={styles.stepFooter}>
      <div className={styles.previousAction}>
        {previousStep ? (
          <Link href={getOnboardingRoute(previousStep)}>Back</Link>
        ) : (
          <span>Secure setup</span>
        )}
      </div>

      <div className={styles.footerStatus} aria-live="polite">
        <span>{saving ? "SAVING" : "✓"}</span>
        <small>{saving ? "Protecting progress" : "Progress saves automatically"}</small>
      </div>

      <div className={styles.primaryAction}>{children}</div>
    </footer>
  );
}

function OnboardingFrame({
  step,
  draft,
  children,
  footer,
  online,
}: {
  step: OnboardingStep;
  draft: OnboardingDraft;
  children: ReactNode;
  footer: ReactNode;
  online: boolean;
}) {
  return (
    <main className={styles.page} data-testid={`onboarding-${step}`}>
      <StepRail currentStep={step} draft={draft} />

      <section className={styles.stage}>
        <header className={styles.mobileHeader}>
          <Brand />
          <Progress draft={draft} />
        </header>

        <header className={styles.desktopHeader}>
          <div>
            <span>PLAYER ONBOARDING</span>
            <strong>
              STEP {stepOrder.indexOf(step) + 1} OF {stepOrder.length}
            </strong>
          </div>
          <div className={styles.connectionStatus} data-online={online}>
            <span>{online ? "PROGRESS SAVED" : "OFFLINE"}</span>
            <b>{online ? "ONLINE" : "RECONNECT"}</b>
          </div>
        </header>

        {!online ? (
          <div className={styles.offlineBanner} role="status">
            You are offline. Existing selections remain visible, but saving is paused.
          </div>
        ) : null}

        <div className={styles.stageBody}>
          <section className={styles.content}>{children}</section>

          <aside className={styles.contextPanel}>
            <span>STEP CONTEXT</span>
            <h2>{stepDetails[step].label}</h2>
            <p>{stepDetails[step].description}</p>

            <div>
              <strong>SECURE PROGRESS</strong>
              <p>Every mutation is validated by the onboarding schema before persistence.</p>
            </div>

            <div>
              <strong>FAILURE ISOLATION</strong>
              <p>Option widgets may fail without removing previous-step navigation or recovery actions.</p>
            </div>
          </aside>
        </div>

        {footer}
      </section>
    </main>
  );
}

function useSaveProgress() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: OnboardingProgressUpdate) =>
      saveOnboardingProgressRequest(update),
    onSuccess: (draft) => {
      queryClient.setQueryData(progressQueryKey, draft);
      router.push(getOnboardingRoute(draft.currentStep));
    },
  });
}

function WelcomeStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const saveMutation = useSaveProgress();

  return (
    <OnboardingFrame
      step="welcome"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="welcome" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending}
            onClick={() =>
              saveMutation.mutate({
                step: "welcome",
                payload: { acknowledged: true },
              })
            }
          >
            {saveMutation.isPending ? "Saving" : "Begin setup"}
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="welcome" />

      <div className={styles.welcomeHero}>
        <div className={styles.heroOrb} aria-hidden="true">
          <span />
          <strong>V</strong>
        </div>

        <div className={styles.benefitGrid}>
          <article>
            <span>SMART MATCHES</span>
            <strong>GAME + REGION</strong>
            <p>Meet opponents who fit your competitive profile.</p>
          </article>
          <article>
            <span>LIVE RANKING</span>
            <strong>EVERY RESULT</strong>
            <p>Your ranking responds to verified match outcomes.</p>
          </article>
          <article>
            <span>CREW READY</span>
            <strong>FIND YOUR FIT</strong>
            <p>Discover teammates who play when and how you do.</p>
          </article>
        </div>
      </div>

      <section className={styles.setupOverview}>
        <span>ABOUT 3 MINUTES</span>
        <div>
          <p>Choose games and region</p>
          <p>Create your player identity</p>
          <p>Set availability and Crew preference</p>
        </div>
      </section>

      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function GamesStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const optionsQuery = useQuery({
    queryKey: ["onboarding", "options", "games"],
    queryFn: getOnboardingGameOptions,
  });
  const saveMutation = useSaveProgress();
  const [selected, setSelected] = useState<string[]>(draft.selectedGameIds);
  const [validationError, setValidationError] = useState<string | null>(null);


  const toggleGame = (gameId: string, maximumSelections: number) => {
    setValidationError(null);
    setSelected((current) => {
      if (current.includes(gameId)) {
        return current.filter((id) => id !== gameId);
      }

      if (current.length >= maximumSelections) {
        setValidationError(`Choose no more than ${maximumSelections} games.`);
        return current;
      }

      return [...current, gameId];
    });
  };

  const submit = () => {
    if (selected.length === 0) {
      setValidationError("Select at least one game.");
      return;
    }

    saveMutation.mutate({
      step: "games",
      payload: { selectedGameIds: selected },
    });
  };

  const data = optionsQuery.data;

  return (
    <OnboardingFrame
      step="games"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="games" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending || !data}
            onClick={submit}
          >
            Continue
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="games" />

      {optionsQuery.isPending ? (
        <StatePanel
          state="loading"
          title="Loading game catalog"
          message="Preparing supported competitive games and platforms."
        />
      ) : optionsQuery.error ? (
        <StatePanel
          {...getErrorView(optionsQuery.error)}
          retry={() => void optionsQuery.refetch()}
        />
      ) : !data || data.games.length === 0 ? (
        <StatePanel
          state="empty"
          title="No games available"
          message="The competitive game catalog is empty. Retry before continuing."
          retry={() => void optionsQuery.refetch()}
        />
      ) : (
        <>
          <MetaNotice meta={data.meta} />
          <div className={styles.selectionBar}>
            <strong>{selected.length} SELECTED</strong>
            <span>Choose up to {data.maximumSelections}</span>
          </div>
          <div className={styles.gameGrid}>
            {data.games.map((game) => {
              const isSelected = selected.includes(game.id);
              const recommended = data.recommendedGameIds.includes(game.id);

              return (
                <button
                  key={game.id}
                  type="button"
                  className={`${styles.optionCard} ${
                    isSelected ? styles.optionCardSelected : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => toggleGame(game.id, data.maximumSelections)}
                >
                  <span className={styles.optionIcon}>
                    {game.shortName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={styles.optionCopy}>
                    <strong>{game.name}</strong>
                    <small>{game.platforms.join(" · ")}</small>
                  </span>
                  {recommended ? <b>RECOMMENDED</b> : null}
                  <span className={styles.optionCheck}>{isSelected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {validationError ? (
        <div className={styles.validationError} role="alert">
          {validationError}
        </div>
      ) : null}
      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function LocationStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const optionsQuery = useQuery({
    queryKey: ["onboarding", "options", "locations"],
    queryFn: () => getOnboardingLocationOptions(),
  });
  const saveMutation = useSaveProgress();
  const [countryCode, setCountryCode] = useState(
    draft.location?.countryCode ?? "",
  );
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [timezone, setTimezone] = useState(draft.location?.timezone ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const data = optionsQuery.data;
  const effectiveCountryCode =
    countryCode ||
    data?.selectedCountryCode ||
    data?.countries[0]?.code ||
    "";
  const draftRegionId =
    data?.regions.find(
      (region) =>
        region.countryCode === effectiveCountryCode &&
        region.name === draft.location?.region,
    )?.id ?? "";
  const effectiveRegionId =
    regionId ||
    draftRegionId ||
    data?.selectedRegionId ||
    data?.regions.find(
      (region) => region.countryCode === effectiveCountryCode,
    )?.id ||
    "";
  const draftCityId =
    data?.cities.find(
      (city) =>
        city.regionId === effectiveRegionId &&
        city.name === draft.location?.city,
    )?.id ?? "";
  const effectiveCityId =
    cityId ||
    draftCityId ||
    data?.cities.find((city) => city.regionId === effectiveRegionId)?.id ||
    "";
  const effectiveTimezone =
    timezone || data?.timezones[0] || "";
  const regions =
    data?.regions.filter(
      (region) => region.countryCode === effectiveCountryCode,
    ) ?? [];
  const cities =
    data?.cities.filter((city) => city.regionId === effectiveRegionId) ?? [];

  const submit = () => {
    const region = data?.regions.find(
      (item) => item.id === effectiveRegionId,
    );
    const city = data?.cities.find(
      (item) => item.id === effectiveCityId,
    );

    if (
      !effectiveCountryCode ||
      !region ||
      !city ||
      !effectiveTimezone
    ) {
      setValidationError("Choose a country, region, city, and timezone.");
      return;
    }

    setValidationError(null);
    saveMutation.mutate({
      step: "location",
      payload: {
        countryCode: effectiveCountryCode,
        region: region.name,
        city: city.name,
        timezone: effectiveTimezone,
      },
    });
  };

  return (
    <OnboardingFrame
      step="location"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="location" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending || !data}
            onClick={submit}
          >
            Continue
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="location" />

      {optionsQuery.isPending ? (
        <StatePanel
          state="loading"
          title="Resolving locations"
          message="Loading countries, regions, cities, and timezones."
        />
      ) : optionsQuery.error ? (
        <StatePanel
          {...getErrorView(optionsQuery.error)}
          retry={() => void optionsQuery.refetch()}
        />
      ) : !data || data.countries.length === 0 ? (
        <StatePanel
          state="empty"
          title="No locations available"
          message="Location options are unavailable. Retry this widget."
          retry={() => void optionsQuery.refetch()}
        />
      ) : (
        <>
          <MetaNotice meta={data.meta} />
          <section className={styles.locationSummary}>
            <div className={styles.radar} aria-hidden="true">
              <span />
              <strong>{effectiveCountryCode || "--"}</strong>
            </div>
            <div>
              <span>REGION DETECTION</span>
              <strong>West Africa matchmaking pool</strong>
              <small>Location is used for latency, timing, and eligibility.</small>
            </div>
          </section>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>COUNTRY</span>
              <select
                value={effectiveCountryCode}
                onChange={(event) => {
                  const nextCountry = event.target.value;
                  const nextRegion = data.regions.find(
                    (region) => region.countryCode === nextCountry,
                  );
                  const nextCity = data.cities.find(
                    (city) => city.regionId === nextRegion?.id,
                  );

                  setCountryCode(nextCountry);
                  setRegionId(nextRegion?.id ?? "");
                  setCityId(nextCity?.id ?? "");
                }}
              >
                {data.countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>STATE / REGION</span>
              <select
                value={effectiveRegionId}
                onChange={(event) => {
                  const nextRegion = event.target.value;
                  setRegionId(nextRegion);
                  setCityId(
                    data.cities.find((city) => city.regionId === nextRegion)?.id ?? "",
                  );
                }}
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>CITY</span>
              <select
                value={effectiveCityId}
                onChange={(event) => setCityId(event.target.value)}
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>TIMEZONE</span>
              <select
                value={effectiveTimezone}
                onChange={(event) => setTimezone(event.target.value)}
              >
                {data.timezones.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.privacyNotice}>
            <strong>PRIVATE BY DEFAULT</strong>
            <span>Your precise location is never shown publicly.</span>
          </div>
        </>
      )}

      {validationError ? (
        <div className={styles.validationError} role="alert">
          {validationError}
        </div>
      ) : null}
      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function IdentityStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const optionsQuery = useQuery({
    queryKey: ["onboarding", "options", "identity"],
    queryFn: getOnboardingIdentityOptions,
  });
  const saveMutation = useSaveProgress();
  const [identity, setIdentity] = useState<PlayerIdentityInput>(
    draft.playerIdentity ?? {
      gamerTag: "",
      platform: "playstation",
      platformHandle: "",
    },
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const data = optionsQuery.data;

  const submit = () => {
    const gamerTag = identity.gamerTag.trim();
    const platformHandle = identity.platformHandle.trim();
    const rules = data?.gamerTagRules;

    if (!rules) {
      return;
    }

    if (
      gamerTag.length < rules.minimumLength ||
      gamerTag.length > rules.maximumLength
    ) {
      setValidationError(
        `Gamer tag must be ${rules.minimumLength}-${rules.maximumLength} characters.`,
      );
      return;
    }

    if (rules.reservedWords.includes(gamerTag.toLowerCase())) {
      setValidationError("That gamer tag is reserved. Choose another.");
      return;
    }

    if (platformHandle.length < 2) {
      setValidationError("Enter your platform identity.");
      return;
    }

    setValidationError(null);
    saveMutation.mutate({
      step: "identity",
      payload: {
        ...identity,
        gamerTag,
        platformHandle,
      },
    });
  };

  const platform = data?.platforms.find((item) => item.id === identity.platform);

  return (
    <OnboardingFrame
      step="identity"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="identity" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending || !data}
            onClick={submit}
          >
            Continue
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="identity" />

      {optionsQuery.isPending ? (
        <StatePanel
          state="loading"
          title="Loading identity rules"
          message="Preparing gamer-tag and platform requirements."
        />
      ) : optionsQuery.error ? (
        <StatePanel
          {...getErrorView(optionsQuery.error)}
          retry={() => void optionsQuery.refetch()}
        />
      ) : !data || data.platforms.length === 0 ? (
        <StatePanel
          state="empty"
          title="No platforms available"
          message="Platform identity options are unavailable."
          retry={() => void optionsQuery.refetch()}
        />
      ) : (
        <>
          <MetaNotice meta={data.meta} />
          <section className={styles.playerPreview}>
            <div className={styles.avatar}>
              {(identity.gamerTag || "VZ").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span>PLAYER CARD PREVIEW</span>
              <strong>{identity.gamerTag || "YOUR GAMER TAG"}</strong>
              <small>
                {platform?.label ?? "Platform"} · Rookie · Level 01
              </small>
            </div>
            <b>0 XP</b>
          </section>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>VERZUS GAMER TAG</span>
              <input
                value={identity.gamerTag}
                maxLength={data.gamerTagRules.maximumLength}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    gamerTag: event.target.value,
                  }))
                }
                autoComplete="nickname"
              />
              <small>
                {identity.gamerTag.length}/{data.gamerTagRules.maximumLength} characters
              </small>
            </label>

            <label className={styles.field}>
              <span>PRIMARY PLATFORM</span>
              <select
                value={identity.platform}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    platform: event.target.value as PlayerIdentityInput["platform"],
                  }))
                }
              >
                {data.platforms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>{platform?.handleLabel.toUpperCase() ?? "PLATFORM ID"}</span>
              <input
                value={identity.platformHandle}
                maxLength={40}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    platformHandle: event.target.value,
                  }))
                }
                autoComplete="off"
              />
              <small>Used for match verification and opponent connection.</small>
            </label>
          </div>
        </>
      )}

      {validationError ? (
        <div className={styles.validationError} role="alert">
          {validationError}
        </div>
      ) : null}
      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function AvailabilityStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const timezone = draft.location?.timezone ?? "Africa/Lagos";
  const optionsQuery = useQuery({
    queryKey: ["onboarding", "options", "availability", timezone],
    queryFn: () => getOnboardingAvailabilityOptions({ timezone }),
  });
  const saveMutation = useSaveProgress();
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    draft.availability.length > 0
      ? draft.availability
      : [{ day: "saturday", startTime: "18:00", endTime: "22:00" }],
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const data = optionsQuery.data;

  const updateSlot = (index: number, patch: Partial<AvailabilitySlot>) => {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  const addSlot = () => {
    if (!data || slots.length >= data.slotRules.maximumWindows) {
      return;
    }

    setSlots((current) => [
      ...current,
      {
        day: data.days[0]?.id ?? "saturday",
        startTime: "18:00",
        endTime: "20:00",
      },
    ]);
  };

  const submit = () => {
    if (slots.length === 0) {
      setValidationError("Add at least one availability window.");
      return;
    }

    const invalid = slots.some((slot) => slot.endTime <= slot.startTime);

    if (invalid) {
      setValidationError("Every end time must be later than its start time.");
      return;
    }

    setValidationError(null);
    saveMutation.mutate({
      step: "availability",
      payload: { slots },
    });
  };

  return (
    <OnboardingFrame
      step="availability"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="availability" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending || !data}
            onClick={submit}
          >
            Save availability
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="availability" />

      {optionsQuery.isPending ? (
        <StatePanel
          state="loading"
          title="Loading schedule rules"
          message="Preparing timezone-aware availability controls."
        />
      ) : optionsQuery.error ? (
        <StatePanel
          {...getErrorView(optionsQuery.error)}
          retry={() => void optionsQuery.refetch()}
        />
      ) : !data || data.days.length === 0 ? (
        <StatePanel
          state="empty"
          title="Availability options unavailable"
          message="No scheduling days were returned. Retry this widget."
          retry={() => void optionsQuery.refetch()}
        />
      ) : (
        <>
          <MetaNotice meta={data.meta} />
          <div className={styles.timezoneBar}>
            <span>TIMEZONE</span>
            <strong>{data.timezone}</strong>
          </div>

          <section className={styles.schedulePanel}>
            <header>
              <div>
                <span>WEEKLY WINDOWS</span>
                <strong>{slots.length} configured</strong>
              </div>
              <button type="button" onClick={addSlot}>
                + Add window
              </button>
            </header>

            <div className={styles.slotList}>
              {slots.map((slot, index) => (
                <div key={`${slot.day}-${index}`} className={styles.slotRow}>
                  <label>
                    <span>DAY</span>
                    <select
                      value={slot.day}
                      onChange={(event) =>
                        updateSlot(index, {
                          day: event.target.value as AvailabilitySlot["day"],
                        })
                      }
                    >
                      {data.days.map((day) => (
                        <option key={day.id} value={day.id}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>START</span>
                    <input
                      type="time"
                      step={data.slotRules.minuteIncrement * 60}
                      value={slot.startTime}
                      onChange={(event) =>
                        updateSlot(index, { startTime: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>END</span>
                    <input
                      type="time"
                      step={data.slotRules.minuteIncrement * 60}
                      value={slot.endTime}
                      onChange={(event) =>
                        updateSlot(index, { endTime: event.target.value })
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className={styles.removeSlot}
                    aria-label={`Remove availability window ${index + 1}`}
                    onClick={() =>
                      setSlots((current) =>
                        current.filter((_, slotIndex) => slotIndex !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {validationError ? (
        <div className={styles.validationError} role="alert">
          {validationError}
        </div>
      ) : null}
      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function CrewStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const gameId = draft.selectedGameIds[0];
  const optionsQuery = useQuery({
    queryKey: ["onboarding", "options", "crews", gameId ?? "all"],
    queryFn: () => getOnboardingCrewOptions(gameId ? { gameId } : {}),
  });
  const saveMutation = useSaveProgress();
  const [choice, setChoice] = useState<CrewChoice>(
    draft.crewChoice ?? { decision: "skip", crewId: null },
  );

  const data = optionsQuery.data;

  const submit = () => {
    saveMutation.mutate({
      step: "crew",
      payload: choice,
    });
  };

  return (
    <OnboardingFrame
      step="crew"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="crew" saving={saveMutation.isPending}>
          <PrimaryButton
            disabled={!online || saveMutation.isPending || !data}
            onClick={submit}
          >
            {choice.decision === "join" ? "Join selected Crew" : "Skip Crew for now"}
          </PrimaryButton>
        </StepFooter>
      }
    >
      <ScreenHeading step="crew" />

      {optionsQuery.isPending ? (
        <StatePanel
          state="loading"
          title="Finding compatible Crews"
          message="Matching your games, region, and availability."
        />
      ) : optionsQuery.error ? (
        <StatePanel
          {...getErrorView(optionsQuery.error)}
          retry={() => void optionsQuery.refetch()}
        />
      ) : !data || data.crews.length === 0 ? (
        <>
          <StatePanel
            state="empty"
            title="No Crew matches yet"
            message="Crew discovery is empty, but you can safely skip and continue."
            retry={() => void optionsQuery.refetch()}
          />
          <button
            type="button"
            className={`${styles.skipCard} ${
              choice.decision === "skip" ? styles.skipCardSelected : ""
            }`}
            onClick={() => setChoice({ decision: "skip", crewId: null })}
          >
            Continue without a Crew
          </button>
        </>
      ) : (
        <>
          <MetaNotice meta={data.meta} />
          <div className={styles.crewGrid}>
            {data.crews.map((crew, index) => {
              const selected = choice.decision === "join" && choice.crewId === crew.id;

              return (
                <button
                  key={crew.id}
                  type="button"
                  className={`${styles.crewCard} ${
                    selected ? styles.crewCardSelected : ""
                  }`}
                  aria-pressed={selected}
                  disabled={!crew.acceptingMembers}
                  onClick={() => setChoice({ decision: "join", crewId: crew.id })}
                >
                  <span className={styles.crewLogo}>{crew.tag}</span>
                  <span className={styles.crewCopy}>
                    <span>
                      {index === 0 ? "TOP MATCH" : "STRONG MATCH"} · {crew.memberCount} MEMBERS
                    </span>
                    <strong>{crew.name}</strong>
                    <small>{crew.fitReasons.join(" · ")}</small>
                    <span className={styles.crewTags}>
                      {crew.supportedGameIds.map((id) => (
                        <b key={id}>{id.toUpperCase()}</b>
                      ))}
                    </span>
                  </span>
                  <span className={styles.optionCheck}>{selected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`${styles.skipCard} ${
              choice.decision === "skip" ? styles.skipCardSelected : ""
            }`}
            aria-pressed={choice.decision === "skip"}
            onClick={() => setChoice({ decision: "skip", crewId: null })}
          >
            <strong>Skip Crew for now</strong>
            <span>You can join or create a Crew later.</span>
          </button>
        </>
      )}

      <MutationError error={saveMutation.error} />
    </OnboardingFrame>
  );
}

function CompleteStep({
  draft,
  online,
}: {
  draft: OnboardingDraft;
  online: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const completeMutation = useMutation({
    mutationFn: finishOnboarding,
    onSuccess: (completedDraft) => {
      queryClient.setQueryData(progressQueryKey, completedDraft);
      router.push("/play");
    },
  });

  const crewLabel =
    draft.crewChoice?.decision === "join" ? "Crew selected" : "Skipped for now";

  return (
    <OnboardingFrame
      step="complete"
      draft={draft}
      online={online}
      footer={
        <StepFooter step="complete" saving={completeMutation.isPending}>
          <PrimaryButton
            disabled={!online || completeMutation.isPending}
            onClick={() => completeMutation.mutate()}
          >
            {completeMutation.isPending ? "Activating profile" : "Enter VERZUS"}
          </PrimaryButton>
        </StepFooter>
      }
    >
      <div className={styles.completeHero}>
        <div className={styles.completeMark}>✓</div>
        <ScreenHeading step="complete" />
      </div>

      <section className={styles.playerPreview}>
        <div className={styles.avatar}>
          {(draft.playerIdentity?.gamerTag ?? "VZ").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <span>PLAYER IDENTITY</span>
          <strong>{draft.playerIdentity?.gamerTag ?? "VERZUS PLAYER"}</strong>
          <small>
            {draft.selectedGameIds.join(" · ")} · {draft.location?.city ?? "Region ready"}
          </small>
        </div>
        <b>LV. 01</b>
      </section>

      <div className={styles.summaryGrid}>
        <article>
          <span>GAMES</span>
          <strong>{draft.selectedGameIds.length}</strong>
        </article>
        <article>
          <span>REGION</span>
          <strong>{draft.location?.region ?? "READY"}</strong>
        </article>
        <article>
          <span>AVAILABILITY</span>
          <strong>{draft.availability.length} WINDOWS</strong>
        </article>
        <article>
          <span>CREW</span>
          <strong>{crewLabel}</strong>
        </article>
      </div>

      <section className={styles.firstMission}>
        <span>FIRST MISSION · 250 XP</span>
        <strong>Complete your first ranked match</strong>
        <p>Enter Play to see your next action and available competitive opportunities.</p>
      </section>

      <MutationError error={completeMutation.error} />
    </OnboardingFrame>
  );
}

function StepRenderer({
  step,
  draft,
  online,
}: {
  step: OnboardingStep;
  draft: OnboardingDraft;
  online: boolean;
}) {
  switch (step) {
    case "welcome":
      return <WelcomeStep draft={draft} online={online} />;
    case "games":
      return <GamesStep draft={draft} online={online} />;
    case "location":
      return <LocationStep draft={draft} online={online} />;
    case "identity":
      return <IdentityStep draft={draft} online={online} />;
    case "availability":
      return <AvailabilityStep draft={draft} online={online} />;
    case "crew":
      return <CrewStep draft={draft} online={online} />;
    case "complete":
      return <CompleteStep draft={draft} online={online} />;
  }
}

function LoadingShell() {
  return (
    <main className={styles.loadingPage} data-testid="onboarding-loading">
      <Brand />
      <StatePanel
        state="loading"
        title="Loading your onboarding progress"
        message="Restoring the latest validated setup state."
      />
    </main>
  );
}

export function OnboardingExperience({ step }: { step: OnboardingStep }) {
  const router = useRouter();
  const online = useOnlineState();
  const progressQuery = useQuery({
    queryKey: progressQueryKey,
    queryFn: getOnboardingProgress,
  });

  useEffect(() => {
    if (!progressQuery.data) {
      return;
    }

    const redirect = resolveOnboardingRouteRedirect(progressQuery.data, step);

    if (redirect) {
      router.replace(redirect);
    }
  }, [progressQuery.data, router, step]);

  if (progressQuery.isPending) {
    return <LoadingShell />;
  }

  if (progressQuery.error) {
    const view = getErrorView(progressQuery.error);

    return (
      <main className={styles.loadingPage}>
        <Brand />
        <StatePanel
          {...view}
          retry={view.retryable ? () => void progressQuery.refetch() : undefined}
        />
      </main>
    );
  }

  const redirect = resolveOnboardingRouteRedirect(progressQuery.data, step);

  if (redirect) {
    return <LoadingShell />;
  }

  return <StepRenderer step={step} draft={progressQuery.data} online={online} />;
}
EOF

cat > "$UI_DIR/onboarding-experience.module.css" <<'EOF'
/* VERZUS M4 PRODUCTION ONBOARDING ROUTES */

.page,
.loadingPage {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  color: #f7f9ff;
  background:
    radial-gradient(circle at 88% 8%, rgb(109 44 255 / 20%), transparent 32rem),
    radial-gradient(circle at 8% 82%, rgb(0 245 212 / 7%), transparent 30rem),
    #060914;
}

.page {
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
}

.loadingPage {
  display: grid;
  place-content: center;
  gap: 28px;
  padding: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brandMark {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  clip-path: polygon(50% 0, 100% 22%, 88% 82%, 50% 100%, 12% 82%, 0 22%);
  background: linear-gradient(135deg, #00f5d4, #7657ff);
  color: #06100f;
  font-family: var(--vz-font-display);
  font-size: 19px;
  font-weight: 900;
}

.brandCopy {
  display: grid;
}

.brandCopy strong {
  font-family: var(--vz-font-display);
  font-size: 15px;
  letter-spacing: 0.14em;
}

.brandCopy small {
  color: #6f7b98;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.stepRail {
  position: sticky;
  top: 0;
  display: flex;
  min-height: 100vh;
  min-height: 100svh;
  flex-direction: column;
  padding: 28px 20px;
  border-right: 1px solid #252d46;
  background:
    linear-gradient(180deg, rgb(103 38 238 / 16%), transparent 42%),
    #090d1b;
}

.railSteps {
  display: grid;
  gap: 8px;
  margin-top: 42px;
}

.railStep {
  display: grid;
  grid-template-columns: 31px 1fr;
  gap: 10px;
  align-items: center;
  min-height: 56px;
  padding: 9px;
  border: 1px solid transparent;
  color: #66728d;
  text-decoration: none;
}

.railStep:hover {
  color: #e9edff;
  border-color: #303a57;
}

.railStep[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.66;
}

.railNumber {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border: 1px solid #35415f;
  font-size: 10px;
  font-weight: 900;
}

.railCopy {
  display: grid;
  gap: 2px;
}

.railCopy strong {
  font-family: var(--vz-font-display);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.railCopy small {
  font-size: 7px;
}

.railStepActive {
  color: #f8f9ff;
  border-color: #00f5d4;
  background: rgb(0 245 212 / 6%);
}

.railStepActive .railNumber {
  color: #06100f;
  background: #00f5d4;
  border-color: #00f5d4;
}

.railStepComplete .railNumber {
  color: #c2b4ff;
  border-color: #7657ff;
}

.saveNotice {
  margin-top: auto;
  padding: 13px;
  border-left: 2px solid #00f5d4;
  background: rgb(0 245 212 / 5%);
}

.saveNotice span {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.saveNotice p {
  margin: 5px 0 0;
  color: #7784a1;
  font-size: 9px;
  line-height: 1.45;
}

.stage {
  display: grid;
  min-width: 0;
  min-height: 100vh;
  min-height: 100svh;
  grid-template-rows: auto auto 1fr auto;
}

.desktopHeader,
.mobileHeader {
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 80px;
  padding: 18px clamp(22px, 4vw, 58px);
  border-bottom: 1px solid #252d46;
  background: rgb(8 12 24 / 88%);
  backdrop-filter: blur(16px);
}

.desktopHeader {
  display: flex;
}

.mobileHeader {
  display: none;
}

.desktopHeader > div:first-child {
  display: grid;
  gap: 3px;
}

.desktopHeader > div:first-child span {
  color: #00f5d4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.desktopHeader > div:first-child strong {
  font-family: var(--vz-font-display);
  font-size: 13px;
}

.connectionStatus {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connectionStatus span,
.connectionStatus b {
  font-size: 7px;
  letter-spacing: 0.1em;
}

.connectionStatus span {
  color: #7f8ba8;
}

.connectionStatus b {
  color: #ff8d8d;
}

.connectionStatus[data-online="true"] b {
  color: #00f5d4;
}

.offlineBanner {
  padding: 11px clamp(22px, 4vw, 58px);
  border-bottom: 1px solid rgb(255 204 80 / 32%);
  color: #ffe098;
  background: rgb(255 204 80 / 8%);
  font-size: 12px;
}

.stageBody {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: clamp(20px, 3vw, 38px);
  align-items: start;
  padding: clamp(28px, 4vw, 58px);
}

.content {
  display: grid;
  align-content: start;
  gap: 20px;
  min-width: 0;
  max-width: 980px;
}

.contextPanel {
  position: sticky;
  top: 104px;
  padding: 19px;
  border: 1px solid #29334e;
  background: rgb(11 16 32 / 86%);
}

.contextPanel > span,
.contextPanel div strong {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.contextPanel h2 {
  margin: 7px 0 8px;
  font-family: var(--vz-font-display);
  font-size: 20px;
  text-transform: uppercase;
}

.contextPanel p {
  margin: 0;
  color: #8591ad;
  font-size: 10px;
  line-height: 1.55;
}

.contextPanel div {
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid #252e47;
}

.contextPanel div p {
  margin-top: 6px;
}

.progress {
  width: min(320px, 44vw);
}

.progressMeta {
  display: flex;
  justify-content: space-between;
  color: #7783a0;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.progressMeta strong {
  color: #00f5d4;
}

.progressTrack {
  height: 4px;
  margin-top: 7px;
  overflow: hidden;
  background: #1d2439;
}

.progressTrack span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00f5d4, #7657ff);
  box-shadow: 0 0 14px rgb(0 245 212 / 45%);
}

.screenHeading > span {
  color: #00f5d4;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.screenHeading h1 {
  margin: 8px 0 11px;
  font-family: var(--vz-font-display);
  font-size: clamp(40px, 5vw, 68px);
  line-height: 0.94;
  letter-spacing: -0.045em;
  text-transform: uppercase;
}

.screenHeading p {
  max-width: 760px;
  margin: 0;
  color: #9aa6c0;
  font-size: 14px;
  line-height: 1.62;
}

.statePanel {
  display: grid;
  gap: 10px;
  min-height: 230px;
  place-content: center;
  padding: 28px;
  border: 1px solid #2d3856;
  background:
    linear-gradient(145deg, rgb(109 44 255 / 10%), transparent 56%),
    #0a0f1f;
  text-align: center;
}

.statePanel > span {
  color: #00f5d4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.statePanel h2 {
  margin: 0;
  font-family: var(--vz-font-display);
  font-size: 24px;
  text-transform: uppercase;
}

.statePanel p {
  max-width: 560px;
  margin: 0 auto;
  color: #909db9;
  font-size: 12px;
  line-height: 1.55;
}

.stateActions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}

.stateActions button,
.stateActions a {
  min-height: 40px;
  padding: 11px 16px;
  border: 1px solid #00f5d4;
  color: #00f5d4;
  background: transparent;
  font: inherit;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
}

.partialNotice,
.mutationError,
.validationError,
.privacyNotice {
  padding: 12px 14px;
  border-left: 3px solid #ffcc50;
  color: #d8ceb5;
  background: rgb(255 204 80 / 7%);
  font-size: 11px;
}

.partialNotice strong,
.mutationError strong {
  display: block;
  color: #ffe096;
}

.partialNotice p {
  margin: 4px 0 0;
}

.mutationError,
.validationError {
  border-left-color: #ff6f85;
  color: #ffd8df;
  background: rgb(255 77 108 / 8%);
}

.mutationError span {
  display: block;
  margin-top: 4px;
}

.stepFooter {
  position: sticky;
  z-index: 5;
  bottom: 0;
  display: grid;
  grid-template-columns: minmax(130px, 190px) 1fr minmax(220px, 280px);
  gap: 18px;
  align-items: center;
  min-height: 78px;
  padding: 14px clamp(22px, 4vw, 58px);
  border-top: 1px solid #252d46;
  background: rgb(8 12 24 / 94%);
  backdrop-filter: blur(18px);
}

.previousAction a,
.previousAction > span {
  display: inline-grid;
  min-height: 44px;
  place-items: center;
  padding: 0 18px;
  border: 1px solid #33405e;
  color: #9aa7c4;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
}

.previousAction > span {
  border-color: transparent;
  justify-content: start;
  padding-inline: 0;
  color: #687590;
}

.footerStatus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #74809c;
}

.footerStatus span {
  color: #00f5d4;
  font-size: 10px;
}

.footerStatus small {
  font-size: 8px;
}

.primaryAction {
  min-width: 0;
}

.primaryButton {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 0;
  color: #06110f;
  background: linear-gradient(90deg, #00f5d4, #95ffe3);
  box-shadow: 0 0 26px rgb(0 245 212 / 14%);
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.primaryButton span {
  font-size: 20px;
  line-height: 0;
}

.welcomeHero {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 24px;
  align-items: center;
}

.heroOrb {
  position: relative;
  display: grid;
  width: 180px;
  height: 180px;
  place-items: center;
  border: 1px solid rgb(0 245 212 / 32%);
  border-radius: 50%;
  background: radial-gradient(circle, rgb(0 245 212 / 17%), rgb(109 44 255 / 12%) 48%, transparent 72%);
}

.heroOrb > span {
  position: absolute;
  inset: 20px;
  border: 1px dashed rgb(118 87 255 / 54%);
  border-radius: 50%;
}

.heroOrb strong {
  position: relative;
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  clip-path: polygon(50% 0, 100% 22%, 88% 82%, 50% 100%, 12% 82%, 0 22%);
  color: #06100f;
  background: linear-gradient(135deg, #00f5d4, #7657ff);
  font-size: 34px;
  font-weight: 900;
}

.benefitGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.benefitGrid article,
.summaryGrid article {
  display: grid;
  gap: 6px;
  min-height: 130px;
  align-content: center;
  padding: 16px;
  border: 1px solid #29334e;
  background: #0b1020;
}

.benefitGrid span,
.summaryGrid span {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.benefitGrid strong,
.summaryGrid strong {
  font-family: var(--vz-font-display);
  font-size: 14px;
}

.benefitGrid p {
  margin: 0;
  color: #7f8ba7;
  font-size: 9px;
  line-height: 1.45;
}

.setupOverview {
  padding: 18px;
  border: 1px solid #29334e;
  background: rgb(11 16 32 / 86%);
}

.setupOverview > span {
  color: #00f5d4;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.setupOverview > div {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.setupOverview p {
  margin: 0;
  padding: 12px;
  border: 1px solid #27314b;
  color: #8995b0;
  background: #0a0f1e;
  font-size: 10px;
}

.selectionBar,
.timezoneBar,
.privacyNotice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.selectionBar,
.timezoneBar {
  padding: 11px 13px;
  border: 1px solid #29334d;
  background: #0b1020;
}

.selectionBar strong,
.timezoneBar span {
  color: #00f5d4;
  font-size: 8px;
  letter-spacing: 0.1em;
}

.selectionBar span,
.timezoneBar strong {
  color: #8995b1;
  font-size: 8px;
}

.gameGrid,
.crewGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.optionCard {
  position: relative;
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 11px;
  align-items: center;
  min-height: 78px;
  padding: 11px;
  border: 1px solid #29334f;
  color: #fff;
  background: #0b1020;
  font: inherit;
  text-align: left;
}

.optionCardSelected {
  border-color: #00f5d4;
  background: linear-gradient(90deg, rgb(0 245 212 / 8%), transparent 70%), #0b1020;
  box-shadow: inset 3px 0 0 #00f5d4;
}

.optionIcon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid #3a4565;
  color: #00f5d4;
  background: linear-gradient(145deg, #1d2550, #101527);
  font-size: 10px;
  font-weight: 900;
}

.optionCopy {
  display: grid;
  gap: 4px;
}

.optionCopy strong {
  font-family: var(--vz-font-display);
  font-size: 13px;
}

.optionCopy small {
  color: #7d89a5;
  font-size: 8px;
  text-transform: capitalize;
}

.optionCard > b {
  position: absolute;
  top: 7px;
  right: 37px;
  color: #ffd66e;
  font-size: 6px;
  letter-spacing: 0.08em;
}

.optionCheck {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid #3b4665;
  color: #7e8aa5;
  font-size: 10px;
}

.optionCardSelected .optionCheck,
.crewCardSelected .optionCheck {
  color: #06100f;
  background: #00f5d4;
  border-color: #00f5d4;
}

.locationSummary {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgb(0 245 212 / 24%);
  background: rgb(0 245 212 / 5%);
}

.radar {
  position: relative;
  display: grid;
  width: 104px;
  height: 104px;
  place-items: center;
  border: 1px solid rgb(0 245 212 / 45%);
  border-radius: 50%;
}

.radar::before,
.radar::after {
  position: absolute;
  content: "";
  background: rgb(0 245 212 / 22%);
}

.radar::before {
  width: 1px;
  height: 100%;
}

.radar::after {
  width: 100%;
  height: 1px;
}

.radar span {
  position: absolute;
  inset: 15px;
  border: 1px dashed rgb(118 87 255 / 55%);
  border-radius: 50%;
}

.radar strong {
  z-index: 2;
  color: #00f5d4;
  font-size: 16px;
}

.locationSummary > div:last-child {
  display: grid;
  gap: 4px;
}

.locationSummary > div:last-child span {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.locationSummary > div:last-child strong {
  font-family: var(--vz-font-display);
  font-size: 17px;
  text-transform: uppercase;
}

.locationSummary > div:last-child small {
  color: #7e8aa6;
  font-size: 9px;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.field {
  display: grid;
  gap: 7px;
}

.fieldWide {
  grid-column: 1 / -1;
}

.field > span,
.slotRow label > span {
  color: #8793af;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.field input,
.field select,
.slotRow input,
.slotRow select {
  width: 100%;
  min-height: 48px;
  padding: 0 13px;
  border: 1px solid #2d3754;
  border-radius: 0;
  color: #eef1ff;
  background: #0b1020;
  font: inherit;
  font-size: 12px;
}

.field small {
  color: #66738f;
  font-size: 8px;
}

.privacyNotice {
  border-left-color: #00f5d4;
  color: #8f9bb7;
  background: rgb(0 245 212 / 5%);
}

.privacyNotice strong {
  color: #00f5d4;
  font-size: 8px;
}

.playerPreview {
  display: grid;
  grid-template-columns: 68px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border: 1px solid rgb(118 87 255 / 38%);
  background: linear-gradient(110deg, rgb(118 87 255 / 12%), transparent 65%), #0b1020;
}

.avatar {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  clip-path: polygon(50% 0, 92% 22%, 86% 80%, 50% 100%, 14% 80%, 8% 22%);
  color: #07100f;
  background: linear-gradient(145deg, #6d2cff, #00f5d4);
  font-size: 17px;
  font-weight: 900;
}

.playerPreview > div:nth-child(2) {
  display: grid;
  gap: 3px;
}

.playerPreview span {
  color: #7d89a6;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.playerPreview strong {
  font-family: var(--vz-font-display);
  font-size: 20px;
}

.playerPreview small {
  color: #7e8aa5;
  font-size: 9px;
  text-transform: uppercase;
}

.playerPreview b {
  color: #00f5d4;
  font-size: 9px;
}

.schedulePanel {
  border: 1px solid #29334d;
  background: #0b1020;
}

.schedulePanel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px;
  border-bottom: 1px solid #28314b;
}

.schedulePanel > header > div {
  display: grid;
  gap: 3px;
}

.schedulePanel > header span {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.schedulePanel > header strong {
  font-size: 11px;
}

.schedulePanel > header button {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid #00f5d4;
  color: #00f5d4;
  background: transparent;
  font: inherit;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
}

.slotList {
  display: grid;
}

.slotRow {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  padding: 13px;
  border-bottom: 1px solid #242d46;
}

.slotRow:last-child {
  border-bottom: 0;
}

.slotRow label {
  display: grid;
  gap: 6px;
}

.removeSlot {
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid #4e2b3b;
  color: #ff9bad;
  background: transparent;
  font: inherit;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
}

.crewCard {
  display: grid;
  grid-template-columns: 68px 1fr auto;
  gap: 13px;
  align-items: center;
  min-height: 130px;
  padding: 15px;
  border: 1px solid #29334e;
  color: #fff;
  background: #0b1020;
  font: inherit;
  text-align: left;
}

.crewCardSelected {
  border-color: #00f5d4;
  background: linear-gradient(110deg, rgb(0 245 212 / 8%), transparent 70%), #0b1020;
}

.crewLogo {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  clip-path: polygon(50% 0, 100% 18%, 90% 82%, 50% 100%, 10% 82%, 0 18%);
  color: #06110e;
  background: linear-gradient(145deg, #00f5d4, #4fddb7);
  font-size: 13px;
  font-weight: 900;
}

.crewCopy {
  display: grid;
  gap: 6px;
}

.crewCopy > span:first-child {
  color: #00f5d4;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.09em;
}

.crewCopy > strong {
  font-family: var(--vz-font-display);
  font-size: 17px;
}

.crewCopy > small {
  color: #8490ac;
  font-size: 8px;
  line-height: 1.45;
}

.crewTags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.crewTags b {
  padding: 4px 6px;
  border: 1px solid #33405f;
  color: #00f5d4;
  font-size: 6px;
}

.skipCard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 62px;
  padding: 14px;
  border: 1px solid #303a57;
  color: #9aa6c2;
  background: transparent;
  font: inherit;
  text-align: left;
}

.skipCard strong {
  color: #eef1ff;
  font-size: 11px;
}

.skipCard span {
  font-size: 9px;
}

.skipCardSelected {
  border-color: #7657ff;
  background: rgb(118 87 255 / 8%);
}

.completeHero {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 22px;
  align-items: center;
}

.completeMark {
  display: grid;
  width: 104px;
  height: 104px;
  place-items: center;
  border: 1px solid rgb(0 245 212 / 45%);
  border-radius: 50%;
  color: #00f5d4;
  background: radial-gradient(circle, rgb(0 245 212 / 20%), transparent 68%);
  box-shadow: 0 0 38px rgb(0 245 212 / 15%);
  font-size: 40px;
  font-weight: 900;
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summaryGrid article {
  min-height: 96px;
}

.firstMission {
  display: grid;
  gap: 5px;
  padding: 16px;
  border-left: 3px solid #ffcc50;
  background: rgb(255 204 80 / 7%);
}

.firstMission span {
  color: #ffda7b;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.firstMission strong {
  font-family: var(--vz-font-display);
  font-size: 17px;
}

.firstMission p {
  margin: 0;
  color: #968b70;
  font-size: 10px;
}

@media (max-width: 1080px) {
  .page {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .stageBody {
    grid-template-columns: 1fr;
  }

  .contextPanel {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .contextPanel > span,
  .contextPanel > h2,
  .contextPanel > p {
    grid-column: 1 / -1;
  }

  .contextPanel div {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .welcomeHero {
    grid-template-columns: 150px 1fr;
  }

  .heroOrb {
    width: 145px;
    height: 145px;
  }
}

@media (max-width: 820px) {
  .page {
    display: block;
  }

  .stepRail,
  .desktopHeader {
    display: none;
  }

  .mobileHeader {
    position: sticky;
    z-index: 6;
    top: 0;
    display: flex;
  }

  .stageBody {
    padding: 30px 24px;
  }

  .screenHeading h1 {
    font-size: clamp(38px, 8vw, 58px);
  }

  .contextPanel {
    grid-template-columns: 1fr;
  }

  .contextPanel > span,
  .contextPanel > h2,
  .contextPanel > p {
    grid-column: auto;
  }

  .stepFooter {
    grid-template-columns: 140px 1fr 220px;
    padding-inline: 24px;
  }

  .benefitGrid,
  .summaryGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 620px) {
  .mobileHeader {
    display: grid;
    gap: 16px;
    padding: 18px;
  }

  .progress {
    width: 100%;
  }

  .stageBody {
    padding: 28px 18px 34px;
  }

  .screenHeading h1 {
    font-size: 40px;
  }

  .screenHeading p {
    font-size: 12px;
  }

  .stepFooter {
    position: sticky;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 12px 18px calc(12px + var(--vz-safe-area-bottom));
  }

  .footerStatus {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .previousAction,
  .primaryAction {
    grid-row: 2;
  }

  .previousAction a,
  .previousAction > span,
  .primaryButton {
    min-height: 48px;
  }

  .welcomeHero,
  .locationSummary,
  .completeHero {
    grid-template-columns: 1fr;
  }

  .heroOrb,
  .completeMark {
    justify-self: center;
  }

  .benefitGrid,
  .setupOverview > div,
  .gameGrid,
  .crewGrid,
  .formGrid,
  .summaryGrid {
    grid-template-columns: 1fr;
  }

  .fieldWide {
    grid-column: auto;
  }

  .slotRow {
    grid-template-columns: 1fr 1fr;
  }

  .slotRow label:first-child,
  .removeSlot {
    grid-column: 1 / -1;
  }

  .playerPreview {
    grid-template-columns: 58px 1fr;
  }

  .avatar {
    width: 58px;
    height: 58px;
  }

  .playerPreview > b {
    grid-column: 2;
  }

  .optionCard,
  .crewCard {
    grid-template-columns: 48px 1fr auto;
  }

  .crewLogo {
    width: 48px;
    height: 48px;
  }

  .skipCard,
  .privacyNotice {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 390px) {
  .stageBody {
    padding-inline: 14px;
  }

  .mobileHeader,
  .stepFooter {
    padding-inline: 14px;
  }

  .screenHeading h1 {
    font-size: 36px;
  }

  .stepFooter {
    grid-template-columns: 112px 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .primaryButton,
  .railStep,
  .optionCard,
  .crewCard {
    transition: none;
  }
}
EOF

cat > "$ROUTE_ROOT/layout.tsx" <<'EOF'
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Player onboarding",
    template: "%s | VERZUS",
  },
  description: "Create and activate your VERZUS competitive player identity.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
EOF

create_page() {
  local path="$1"
  local step="$2"
  local title="$3"

  cat > "$path" <<EOF
// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import type { Metadata } from "next";

import { OnboardingExperience } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "$title",
};

export default function OnboardingPage() {
  return <OnboardingExperience step="$step" />;
}
EOF
}

create_page "$ROUTE_ROOT/onboarding/page.tsx" "welcome" "Welcome"
create_page "$ROUTE_ROOT/onboarding/games/page.tsx" "games" "Choose games"
create_page "$ROUTE_ROOT/onboarding/location/page.tsx" "location" "Select location"
create_page "$ROUTE_ROOT/onboarding/identity/page.tsx" "identity" "Player identity"
create_page "$ROUTE_ROOT/onboarding/availability/page.tsx" "availability" "Availability"
create_page "$ROUTE_ROOT/onboarding/crew/page.tsx" "crew" "Crew preference"
create_page "$ROUTE_ROOT/onboarding/complete/page.tsx" "complete" "Setup complete"

cat > "$DOC_FILE" <<'EOF'
<!-- VERZUS M4 PRODUCTION ONBOARDING ROUTES -->

# M4 Production Onboarding Routes

## Purpose

Implement the seven production onboarding routes using the approved responsive
reference direction and the existing M4 contracts.

## Routes

```text
/onboarding
/onboarding/games
/onboarding/location
/onboarding/identity
/onboarding/availability
/onboarding/crew
/onboarding/complete
```

## Architecture

```text
HTTP response
→ Zod schema validation
→ domain adapter
→ TanStack Query cache
→ step view model
→ production UI
```

## Feature ownership

The onboarding domain owns:

```text
API clients and schemas
adapters
state machine
route contracts
security and failure policy
production UI
route-access rules
unit tests
```

The App Router pages remain thin and only select the required onboarding step.

## Supported behavior

```text
loading
success
empty
stale query data
error
offline
retrying
unauthorized
forbidden
maintenance
partial failure
```

Option widgets can fail independently while previous-step navigation and retry
controls remain available.

## Responsive behavior

```text
360px mobile
390px mobile reference
430px mobile
768px tablet
1024px compact desktop
1440px desktop reference
```

Mobile uses a focused single-column presentation. Desktop uses a persistent
step rail, broad content stage, isolated context panel, and sticky action footer.

## Local review

Start the application:

```bash
npm run m4:onboarding
```

Open:

```text
http://localhost:3108/login
```

Use the mock onboarding account:

```text
Email: onboarding@example.com
Password: StrongPass1!
```

The authenticated route sequence begins at:

```text
http://localhost:3108/onboarding
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Rollback

Restore tracked files and remove generated files from this installer:

```bash
git restore src/features/onboarding/index.ts package.json
git clean -fd -- src/features/onboarding/ui "src/app/(onboarding)" docs/milestones/M4/onboarding-production-routes.md
```
EOF

node <<'NODE'
const fs = require("node:fs");

const featureIndex = "src/features/onboarding/index.ts";
let source = fs.readFileSync(featureIndex, "utf8");
const marker = "// VERZUS M4 PRODUCTION ONBOARDING ROUTES EXPORT";
const exportLine = 'export * from "./ui";';

if (!source.includes(marker)) {
  source = `${source.trimEnd()}\n\n${marker}\n${exportLine}\n`;
  fs.writeFileSync(featureIndex, source, "utf8");
}

const packageFile = "package.json";
const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
pkg.scripts ??= {};
pkg.scripts["m4:onboarding"] =
  "next dev --hostname 127.0.0.1 --port 3108";
pkg.scripts["test:m4:onboarding"] =
  "vitest run src/features/onboarding/ui/onboarding-route-access.test.ts";
fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
NODE

echo
echo "Formatting production onboarding files..."
npx prettier \
  "$UI_DIR" \
  "$ROUTE_ROOT" \
  "$DOC_FILE" \
  "$FEATURE_ROOT/index.ts" \
  "$PACKAGE_FILE" \
  --write

echo
echo "Running focused onboarding lint..."
npx eslint \
  "$UI_DIR" \
  "$ROUTE_ROOT" \
  --max-warnings=0

echo
echo "Removing stale generated Next.js development types..."
rm -rf .next/dev/types

echo
echo "Running onboarding route-access unit test..."
npm run test:m4:onboarding

echo
echo "Running TypeScript verification..."
npm run typecheck

echo
echo "Running production build..."
npm run build

echo
echo "Verifying route discovery..."
if npm run | grep -q "m4:routes"; then
  npm run m4:routes
else
  echo "m4:routes is not installed; build output is the route source of truth."
fi

echo
echo "Verifying all 15 M4 production screen routes..."

node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.join(process.cwd(), "src", "app");

const requiredRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/account/suspended",
  "/account/banned",
  "/onboarding",
  "/onboarding/games",
  "/onboarding/location",
  "/onboarding/identity",
  "/onboarding/availability",
  "/onboarding/crew",
  "/onboarding/complete",
];

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(absolute);
    }

    return entry.isFile() ? [absolute] : [];
  });
}

function toRoute(file) {
  const relative = path
    .relative(appRoot, file)
    .split(path.sep);

  if (relative.at(-1) !== "page.tsx") {
    return null;
  }

  const segments = relative
    .slice(0, -1)
    .filter(
      (segment) =>
        !(
          segment.startsWith("(") &&
          segment.endsWith(")")
        ),
    )
    .filter((segment) => !segment.startsWith("@"));

  return segments.length === 0
    ? "/"
    : `/${segments.join("/")}`;
}

const discovered = new Map();

for (const file of walk(appRoot)) {
  const route = toRoute(file);

  if (route) {
    discovered.set(
      route,
      path.relative(process.cwd(), file),
    );
  }
}

const missing = [];

for (const route of requiredRoutes) {
  const file = discovered.get(route);

  if (!file) {
    missing.push(route);
  }

  console.log(
    `${file ? "FOUND  " : "MISSING"} ${route}${
      file ? ` ${file}` : ""
    }`,
  );
}

console.log();
console.log(
  `Required M4 screens: ${
    requiredRoutes.length - missing.length
  } found, ${missing.length} missing.`,
);

if (missing.length > 0) {
  process.exit(1);
}
NODE

echo
echo "All 15 M4 production screen routes are present."
echo
echo "Authentication and account screens:"
echo "http://localhost:3108/login"
echo "http://localhost:3108/register"
echo "http://localhost:3108/verify-email"
echo "http://localhost:3108/forgot-password"
echo "http://localhost:3108/reset-password"
echo "http://localhost:3108/session-expired"
echo "http://localhost:3108/account/suspended"
echo "http://localhost:3108/account/banned"
echo
echo "Onboarding screens:"
echo "http://localhost:3108/onboarding"
echo "http://localhost:3108/onboarding/games"
echo "http://localhost:3108/onboarding/location"
echo "http://localhost:3108/onboarding/identity"
echo "http://localhost:3108/onboarding/availability"
echo "http://localhost:3108/onboarding/crew"
echo "http://localhost:3108/onboarding/complete"
echo
echo "Start the application with:"
echo "npm run m4:onboarding"
echo
echo "Mock onboarding account:"
echo "onboarding@example.com"
echo "StrongPass1!"
