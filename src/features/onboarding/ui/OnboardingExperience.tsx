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
