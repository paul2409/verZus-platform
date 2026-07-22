"use client";

// VERZUS M9.3 CREW CREATION SCREEN

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";

import {
  createEmptyCrewCreationState,
  loadCrewCreationState,
  saveCrewCreationState,
} from "../model/crew-creation.repository";
import {
  crewCreationAssetPaths,
  crewCreationBannerPresets,
  crewCreationCrestPresets,
  crewCreationGames,
  crewCreationLanguages,
  crewCreationMinimumRanks,
  crewCreationRegions,
  crewCreationSteps,
  type CrewCreationDraft,
  type CrewCreationErrors,
  type CrewCreationPersistedState,
  type CrewCreationStep,
} from "../model/crew-creation.types";
import {
  hasCrewCreationErrors,
  normalizeCrewTag,
  validateCrewCreationDraft,
  validateCrewCreationStep,
} from "../model/crew-creation.validation";
import styles from "./CrewCreationScreen.module.css";

const stepLabels: Record<CrewCreationStep, string> = {
  basics: "Basics",
  identity: "Identity",
  settings: "Settings",
  review: "Review",
  created: "Created",
};

export type CrewCreationScreenProps = {
  initialStep: CrewCreationStep;
  membership: "current" | "none";
};

function createSubmissionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `submission-${Date.now().toString(36)}`;
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <span className={styles.fieldError} id={id} role="alert">
      {message}
    </span>
  );
}

function CreationPreview({ draft }: { draft: CrewCreationDraft }) {
  return (
    <aside className={styles.preview} aria-label="Crew identity preview">
      <div className={styles.previewBanner}>
        <Image
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 360px"
          src={crewCreationAssetPaths.banner[draft.bannerPreset]}
        />
      </div>
      <div className={styles.previewBody}>
        <Image
          alt="Selected Crew crest"
          className={styles.previewCrest}
          height={86}
          src={crewCreationAssetPaths.crest[draft.crestPreset]}
          width={76}
        />
        <div>
          <span className={styles.eyebrow}>Live identity preview</span>
          <h2>{draft.name.trim() || "Your Crew name"}</h2>
          <div className={styles.badgeRow}>
            <Badge size="sm" tone="special" variant="outline">
              {draft.tag || "TAG"}
            </Badge>
            <Badge size="sm" tone="information">
              {draft.primaryGame}
            </Badge>
            <Badge size="sm" tone="neutral" variant="outline">
              {draft.region}
            </Badge>
          </div>
        </div>
      </div>
      <p>{draft.description.trim() || "Your Crew description will appear here."}</p>
      <dl className={styles.previewMeta}>
        <div>
          <dt>Lifecycle</dt>
          <dd>Forming</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>You</dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>{draft.visibility}</dd>
        </div>
        <div>
          <dt>Recruiting</dt>
          <dd>{draft.recruiting ? "Open" : "Closed"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function AssetPicker({
  label,
  name,
  options,
  selected,
  onSelect,
  assetType,
}: {
  label: string;
  name: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  assetType: "crest" | "banner";
}) {
  return (
    <fieldset className={styles.assetFieldset}>
      <legend>{label}</legend>
      <div className={assetType === "crest" ? styles.crestGrid : styles.bannerGrid}>
        {options.map((option) => {
          const src =
            assetType === "crest"
              ? crewCreationAssetPaths.crest[option as keyof typeof crewCreationAssetPaths.crest]
              : crewCreationAssetPaths.banner[option as keyof typeof crewCreationAssetPaths.banner];
          return (
            <label className={styles.assetOption} data-selected={selected === option} key={option}>
              <input
                checked={selected === option}
                name={name}
                onChange={() => onSelect(option)}
                type="radio"
                value={option}
              />
              <span className={styles.assetImage} data-asset-type={assetType}>
                <Image alt="" fill sizes="220px" src={src} />
              </span>
              <strong>{option.replace(/-/g, " ")}</strong>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CrewCreationScreen({ initialStep, membership }: CrewCreationScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CrewCreationPersistedState>(() =>
    createEmptyCrewCreationState(createSubmissionId()),
  );
  const [step, setStep] = useState<CrewCreationStep>(initialStep);
  const [errors, setErrors] = useState<CrewCreationErrors>({});
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const persisted = loadCrewCreationState(window.localStorage);
      setState(persisted);
      if (persisted.created && initialStep !== "created") setStep("created");
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [initialStep]);

  useEffect(() => {
    if (!hydrated) return;
    saveCrewCreationState(window.localStorage, state);
  }, [hydrated, state]);

  const navigate = useCallback(
    (nextStep: CrewCreationStep, replace = false) => {
      setStep(nextStep);
      const href = `${pathname}?membership=${membership}&step=${nextStep}`;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [membership, pathname, router],
  );

  const draft = state.draft;
  const currentIndex = crewCreationSteps.indexOf(step);
  const progress = Math.max(1, Math.min(5, currentIndex + 1));

  const updateDraft = useCallback((patch: Partial<CrewCreationDraft>) => {
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key as keyof CrewCreationErrors];
      return next;
    });
    setState((current) => ({
      ...current,
      draft: { ...current.draft, ...patch },
      created:
        current.created?.submissionId === current.draft.submissionId ? null : current.created,
    }));
  }, []);

  const stepErrorCount = useMemo(
    () => Object.keys(validateCrewCreationStep(draft, step)).length,
    [draft, step],
  );

  const continueFromStep = () => {
    const nextErrors = validateCrewCreationStep(draft, step);
    setErrors(nextErrors);
    if (hasCrewCreationErrors(nextErrors)) return;

    if (step === "basics") navigate("identity");
    else if (step === "identity") navigate("settings");
    else if (step === "settings") navigate("review");
  };

  const submitCreation = async () => {
    const nextErrors = validateCrewCreationDraft(draft);
    setErrors(nextErrors);
    setSubmitError(null);
    if (hasCrewCreationErrors(nextErrors) || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/crews", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "idempotency-key": draft.submissionId,
        },
        body: JSON.stringify({
          submissionId: draft.submissionId,
          name: draft.name.trim(),
          tag: draft.tag,
          description: draft.description.trim(),
          primaryGame: draft.primaryGame,
          region: draft.region,
          crestPreset: draft.crestPreset,
          bannerPreset: draft.bannerPreset,
          visibility: draft.visibility,
          recruiting: draft.recruiting,
          language: draft.language,
          minimumRank: draft.minimumRank,
        }),
      });
      const payload = (await response.json()) as {
        data?: CrewCreationPersistedState["created"];
        error?: { message?: string; field_errors?: Record<string, string[]> };
      };
      if (!response.ok || !payload.data) {
        const fieldErrors = payload.error?.field_errors;
        if (fieldErrors) {
          setErrors((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.entries(fieldErrors).map(([key, messages]) => [key, messages[0] ?? "Invalid"]),
            ),
          }));
        }
        throw new Error(payload.error?.message ?? "Crew creation failed.");
      }

      const nextState = { ...state, created: payload.data };
      setState(nextState);
      saveCrewCreationState(window.localStorage, nextState);
      navigate("created", true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Crew creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (membership === "current") {
    return (
      <main className={styles.page} data-m9-stage="9.3">
        <section className={styles.blockedState}>
          <Icon decorative name="lock" size="xxl" />
          <span className={styles.eyebrow}>Crew creation unavailable</span>
          <h1>You already belong to a Crew</h1>
          <p>
            A player may own or join one primary Crew in V1. Leave or transfer ownership through the
            server-controlled membership flow before creating another Crew.
          </p>
          <Link href="/crews">Return to My Crew</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page} data-m9-stage="9.3" data-creation-step={step}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Crew creation</span>
          <h1>Build your competitive identity</h1>
          <p>
            Define your Crew identity and operating settings. Ownership and membership remain
            server-controlled.
          </p>
        </div>
        <Link href="/crews?membership=none&view=discover">Back to discovery</Link>
      </header>

      <ol className={styles.stepper} aria-label="Crew creation progress">
        {crewCreationSteps.map((item, index) => (
          <li
            aria-current={item === step ? "step" : undefined}
            data-complete={index < currentIndex}
            key={item}
          >
            <span>{index + 1}</span>
            <strong>{stepLabels[item]}</strong>
          </li>
        ))}
      </ol>

      <div className={styles.progressMeta}>
        <span>Step {progress} of 5</span>
        <span>
          {stepErrorCount > 0
            ? `${stepErrorCount} fields need attention`
            : "Draft saves automatically"}
        </span>
      </div>

      <div className={styles.layout}>
        <section className={styles.formPanel}>
          {!hydrated ? (
            <div className={styles.loadingState} aria-live="polite">
              Loading saved Crew draft...
            </div>
          ) : step === "basics" ? (
            <div className={styles.stepContent}>
              <div className={styles.sectionHeading}>
                <span>01</span>
                <div>
                  <h2>Crew basics</h2>
                  <p>Name the Crew and define its competitive lane.</p>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <label>
                  <span>Crew name</span>
                  <Input
                    aria-describedby={errors.name ? "crew-name-error" : undefined}
                    aria-invalid={Boolean(errors.name)}
                    maxLength={30}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    placeholder="Night Shift Elite"
                    value={draft.name}
                  />
                  <FieldError id="crew-name-error" message={errors.name} />
                </label>
                <label>
                  <span>Crew tag</span>
                  <Input
                    aria-describedby={errors.tag ? "crew-tag-error" : undefined}
                    aria-invalid={Boolean(errors.tag)}
                    maxLength={5}
                    onChange={(event) => updateDraft({ tag: normalizeCrewTag(event.target.value) })}
                    placeholder="NSE"
                    value={draft.tag}
                  />
                  <FieldError id="crew-tag-error" message={errors.tag} />
                </label>
                <label>
                  <span>Primary game</span>
                  <Select
                    onChange={(event) =>
                      updateDraft({
                        primaryGame: event.target.value as CrewCreationDraft["primaryGame"],
                      })
                    }
                    value={draft.primaryGame}
                  >
                    {crewCreationGames.map((game) => (
                      <option key={game}>{game}</option>
                    ))}
                  </Select>
                </label>
                <label>
                  <span>Region</span>
                  <Select
                    onChange={(event) =>
                      updateDraft({ region: event.target.value as CrewCreationDraft["region"] })
                    }
                    value={draft.region}
                  >
                    {crewCreationRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </Select>
                </label>
              </div>
              <label className={styles.textareaField}>
                <span>Description</span>
                <textarea
                  aria-describedby={
                    errors.description ? "crew-description-error" : "crew-description-help"
                  }
                  aria-invalid={Boolean(errors.description)}
                  maxLength={180}
                  onChange={(event) => updateDraft({ description: event.target.value })}
                  placeholder="Describe your Crew culture, goals and competitive identity."
                  value={draft.description}
                />
                <small id="crew-description-help">{draft.description.length}/180 characters</small>
                <FieldError id="crew-description-error" message={errors.description} />
              </label>
            </div>
          ) : step === "identity" ? (
            <div className={styles.stepContent}>
              <div className={styles.sectionHeading}>
                <span>02</span>
                <div>
                  <h2>Identity assets</h2>
                  <p>Choose production-safe original artwork presets.</p>
                </div>
              </div>
              <AssetPicker
                assetType="crest"
                label="Crew crest"
                name="crestPreset"
                onSelect={(value) =>
                  updateDraft({ crestPreset: value as CrewCreationDraft["crestPreset"] })
                }
                options={crewCreationCrestPresets}
                selected={draft.crestPreset}
              />
              <AssetPicker
                assetType="banner"
                label="Crew banner"
                name="bannerPreset"
                onSelect={(value) =>
                  updateDraft({ bannerPreset: value as CrewCreationDraft["bannerPreset"] })
                }
                options={crewCreationBannerPresets}
                selected={draft.bannerPreset}
              />
              <aside className={styles.policyNote}>
                <Icon decorative name="shield" size="md" />
                <span>
                  Custom uploads stay disabled until file type, size, scanning and moderation
                  controls are available.
                </span>
              </aside>
            </div>
          ) : step === "settings" ? (
            <div className={styles.stepContent}>
              <div className={styles.sectionHeading}>
                <span>03</span>
                <div>
                  <h2>Operating settings</h2>
                  <p>Set visibility, recruiting and entry expectations.</p>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <label>
                  <span>Visibility</span>
                  <Select
                    onChange={(event) =>
                      updateDraft({
                        visibility: event.target.value as CrewCreationDraft["visibility"],
                      })
                    }
                    value={draft.visibility}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </Select>
                </label>
                <label>
                  <span>Language</span>
                  <Select
                    onChange={(event) =>
                      updateDraft({ language: event.target.value as CrewCreationDraft["language"] })
                    }
                    value={draft.language}
                  >
                    {crewCreationLanguages.map((language) => (
                      <option key={language}>{language}</option>
                    ))}
                  </Select>
                </label>
                <label>
                  <span>Minimum rank</span>
                  <Select
                    onChange={(event) =>
                      updateDraft({
                        minimumRank: event.target.value as CrewCreationDraft["minimumRank"],
                      })
                    }
                    value={draft.minimumRank}
                  >
                    {crewCreationMinimumRanks.map((rank) => (
                      <option key={rank}>{rank}</option>
                    ))}
                  </Select>
                </label>
              </div>
              <label className={styles.toggleField}>
                <input
                  checked={draft.recruiting}
                  onChange={(event) => updateDraft({ recruiting: event.target.checked })}
                  type="checkbox"
                />
                <span>
                  <strong>Open recruiting</strong>
                  <small>Players can review fit. Applications activate in M9.5.</small>
                </span>
              </label>
              <aside className={styles.policyNote}>
                <Icon decorative name="users" size="md" />
                <span>
                  You become the owner automatically. The Crew starts in the forming lifecycle with
                  one member.
                </span>
              </aside>
            </div>
          ) : step === "review" ? (
            <div className={styles.stepContent}>
              <div className={styles.sectionHeading}>
                <span>04</span>
                <div>
                  <h2>Review and create</h2>
                  <p>Confirm the Crew contract before the local preview mutation.</p>
                </div>
              </div>
              <dl className={styles.reviewGrid}>
                <div>
                  <dt>Name</dt>
                  <dd>{draft.name}</dd>
                </div>
                <div>
                  <dt>Tag</dt>
                  <dd>{draft.tag}</dd>
                </div>
                <div>
                  <dt>Game</dt>
                  <dd>{draft.primaryGame}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{draft.region}</dd>
                </div>
                <div>
                  <dt>Visibility</dt>
                  <dd>{draft.visibility}</dd>
                </div>
                <div>
                  <dt>Recruiting</dt>
                  <dd>{draft.recruiting ? "Open" : "Closed"}</dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{draft.language}</dd>
                </div>
                <div>
                  <dt>Minimum rank</dt>
                  <dd>{draft.minimumRank}</dd>
                </div>
              </dl>
              <div className={styles.reviewContract}>
                <h3>Creation contract</h3>
                <ul>
                  <li>The creator is assigned the owner role.</li>
                  <li>The Crew starts in the forming lifecycle.</li>
                  <li>Ownership cannot be orphaned by later membership actions.</li>
                  <li>The final submission is persisted by the server and audited.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className={styles.createdState}>
              <Icon decorative name="check" size="xxl" />
              <span className={styles.eyebrow}>Crew foundation created</span>
              <h2>{state.created?.identity.name ?? draft.name}</h2>
              <p>
                The Crew is now stored in VERZUS. You are the owner and the Crew begins in the
                forming lifecycle.
              </p>
              <dl className={styles.createdMeta}>
                <div>
                  <dt>Crew ID</dt>
                  <dd>{state.created?.id ?? "Pending"}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>{state.created?.owner.name ?? "You"}</dd>
                </div>
                <div>
                  <dt>Lifecycle</dt>
                  <dd>{state.created?.lifecycle ?? "forming"}</dd>
                </div>
                <div>
                  <dt>Members</dt>
                  <dd>{state.created?.memberCount ?? 1}</dd>
                </div>
              </dl>
              <div className={styles.createdActions}>
                <Link href={`/crews/${state.created?.id ?? ""}`}>Open Crew profile</Link>
                <Link href="/crews">Return to Crews</Link>
              </div>
            </div>
          )}

          {step !== "created" ? (
            <footer className={styles.actions}>
              {step !== "basics" ? (
                <Button
                  onClick={() =>
                    navigate(crewCreationSteps[Math.max(0, currentIndex - 1)] ?? "basics")
                  }
                  variant="ghost"
                >
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step === "review" ? (
                <div>
                  {submitError ? <p className={styles.fieldError} role="alert">{submitError}</p> : null}
                  <Button loading={submitting} loadingLabel="Creating Crew" onClick={() => void submitCreation()}>
                    Create Crew
                  </Button>
                </div>
              ) : (
                <Button onClick={continueFromStep} trailingIcon="chevron-right">
                  Continue
                </Button>
              )}
            </footer>
          ) : null}
        </section>

        <CreationPreview draft={draft} />
      </div>

      <footer className={styles.foundationNote}>
        <strong>M9.3 CREATION CONTRACT</strong>
        <span>
          Draft and success persist through a versioned local repository. The UI boundary remains
          stable when M9.4 replaces it with schema-validated APIs and TanStack Query resources.
        </span>
      </footer>
    </main>
  );
}
