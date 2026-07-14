// VERZUS M4 ONBOARDING RESPONSIVE REFERENCES

import type { Metadata } from "next";
import type { ReactNode } from "react";

import styles from "./responsive-references.module.css";

export const metadata: Metadata = {
  title: "M4 Responsive Onboarding References | VERZUS",
  description: "Approval-only 768px tablet and 1440px desktop onboarding references for VERZUS M4.",
  robots: {
    index: false,
    follow: false,
  },
};

type Viewport = "tablet" | "desktop";
type StepId = "welcome" | "games" | "location" | "identity" | "availability" | "crew" | "complete";

interface StepDefinition {
  id: StepId;
  number: number;
  title: string;
  purpose: string;
  states: string;
  dependencies: string;
}

interface FrameProps {
  viewport: Viewport;
  step: StepDefinition;
}

interface PanelProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string | undefined;
}

const steps: readonly StepDefinition[] = [
  {
    id: "welcome",
    number: 1,
    title: "Onboarding welcome",
    purpose:
      "Explain why setup matters, confirm resumable progress, and establish one clear starting action.",
    states: "loading, success, stale, offline, maintenance",
    dependencies: "saved progress, player display name, estimated completion time",
  },
  {
    id: "games",
    number: 2,
    title: "Choose games",
    purpose: "Select the games that power matchmaking, ranking, Crew discovery, and opportunities.",
    states: "loading, success, empty, error, partial failure",
    dependencies: "game catalog, supported platforms, saved selections",
  },
  {
    id: "location",
    number: 3,
    title: "Select location",
    purpose: "Collect region and timezone information while making privacy boundaries explicit.",
    states: "loading, success, empty, error, offline",
    dependencies: "countries, regions, cities, timezone, detected region",
  },
  {
    id: "identity",
    number: 4,
    title: "Create player identity",
    purpose: "Create the public gamer tag, platform identity, and player style used across VERZUS.",
    states: "loading, success, validation error, duplicate gamer tag",
    dependencies: "gamer-tag rules, platform identities, player-card preview",
  },
  {
    id: "availability",
    number: 5,
    title: "Set availability",
    purpose:
      "Capture recurring local-time match windows without compressing a dense scheduler into mobile patterns.",
    states: "loading, success, empty schedule, stale, partial failure",
    dependencies: "timezone, days, windows, slot rules",
  },
  {
    id: "crew",
    number: 6,
    title: "Join or skip Crew",
    purpose:
      "Recommend compatible Crews while preserving the skip path and independent widget failure.",
    states: "loading, success, empty, error, partial failure",
    dependencies: "Crew suggestions, game compatibility, location, availability",
  },
  {
    id: "complete",
    number: 7,
    title: "Onboarding complete",
    purpose:
      "Confirm server-authoritative completion and direct the player into the Play command centre.",
    states: "success, retrying, error, session expired",
    dependencies: "completed draft, player summary, first mission, Play destination",
  },
] as const;

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

function Progress({ current, compact = false }: { current: number; compact?: boolean }) {
  return (
    <div
      className={`${styles.progress} ${compact ? styles.progressCompact : ""}`}
      aria-label={`Step ${current} of 7`}
    >
      <div className={styles.progressMeta}>
        <span>PLAYER SETUP</span>
        <strong>{current}/7</strong>
      </div>
      <div className={styles.progressTrack}>
        <span
          style={{
            width: `${(current / 7) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function Panel({ title, eyebrow, children, className = "" }: PanelProps) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <header className={styles.panelHeader}>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h4>{title}</h4>
      </header>
      {children}
    </section>
  );
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className={styles.primaryButton}>
      {children}
      <span aria-hidden="true">›</span>
    </button>
  );
}

function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className={styles.secondaryButton}>
      {children}
    </button>
  );
}

function Field({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div>{value}</div>
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Choice({
  title,
  detail,
  selected = false,
  badge,
}: {
  title: string;
  detail: string;
  selected?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.choice} ${selected ? styles.choiceSelected : ""}`}
      aria-pressed={selected}
    >
      <span className={styles.choiceIcon}>{title.slice(0, 2).toUpperCase()}</span>
      <span className={styles.choiceText}>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      {badge ? <span className={styles.choiceBadge}>{badge}</span> : null}
      <span className={styles.choiceAction}>{selected ? "✓" : "+"}</span>
    </button>
  );
}

function StepRail({ current }: { current: number }) {
  return (
    <aside className={styles.stepRail}>
      <Brand />
      <div className={styles.railSteps}>
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${styles.railStep} ${
              step.number === current ? styles.railStepActive : ""
            } ${step.number < current ? styles.railStepComplete : ""}`}
          >
            <span>{step.number < current ? "✓" : step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <small>
                {step.number === current
                  ? "Current step"
                  : step.number < current
                    ? "Complete"
                    : "Upcoming"}
              </small>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.railSave}>
        <span>LIVE SAVE</span>
        <p>Progress is saved after every validated step.</p>
      </div>
    </aside>
  );
}

function Heading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className={styles.heading}>
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function WelcomeContent({ viewport }: { viewport: Viewport }) {
  return (
    <>
      <div className={styles.welcomeHero}>
        <div className={styles.heroOrb}>
          <span />
          <strong>V</strong>
        </div>
        <Heading
          eyebrow="YOUR COMPETITIVE IDENTITY STARTS HERE"
          title="Build your player profile."
          copy="Set up the essentials VERZUS needs to match you with the right games, opponents, opportunities, and Crew."
        />
      </div>

      <div className={styles.benefitGrid}>
        <Stat label="SMART MATCHES" value="GAME + REGION" />
        <Stat label="LIVE RANKING" value="EVERY RESULT" />
        <Stat label="CREW READY" value="FIND YOUR FIT" />
      </div>

      <Panel title="Setup overview" eyebrow="WHAT HAPPENS NEXT">
        <div className={styles.timeline}>
          <div>
            <span>01</span>
            <p>Choose games and region</p>
          </div>
          <div>
            <span>02</span>
            <p>Create your player identity</p>
          </div>
          <div>
            <span>03</span>
            <p>Set availability and Crew preference</p>
          </div>
        </div>
      </Panel>

      {viewport === "desktop" ? (
        <Panel title="Account status" eyebrow="READY TO CONTINUE">
          <div className={styles.statusRows}>
            <div>
              <span>Email verified</span>
              <strong>READY</strong>
            </div>
            <div>
              <span>Profile progress</span>
              <strong>0%</strong>
            </div>
            <div>
              <span>Estimated time</span>
              <strong>3 MIN</strong>
            </div>
          </div>
        </Panel>
      ) : null}
    </>
  );
}

function GamesContent() {
  return (
    <>
      <Heading
        eyebrow="BUILD YOUR COMPETITIVE POOL"
        title="What do you play?"
        copy="Choose every game you want to compete in. You can update these selections later."
      />

      <div className={styles.selectionBar}>
        <strong>1 SELECTED</strong>
        <span>Choose up to 5</span>
      </div>

      <div className={styles.choiceGrid}>
        <Choice
          title="EA SPORTS FC"
          detail="PlayStation · Xbox · PC"
          selected
          badge="RECOMMENDED"
        />
        <Choice title="eFootball" detail="Console · PC · Mobile" />
        <Choice title="NBA 2K" detail="PlayStation · Xbox · PC" />
        <Choice title="Call of Duty" detail="Console · PC · Mobile" />
        <Choice title="Fortnite" detail="Console · PC · Mobile" />
        <Choice title="Mortal Kombat" detail="PlayStation · Xbox · PC" />
      </div>
    </>
  );
}

function LocationContent() {
  return (
    <>
      <Heading
        eyebrow="COMPETE IN THE RIGHT REGION"
        title="Where are you based?"
        copy="Location improves match timing, latency, event eligibility, and local competitive opportunities."
      />

      <div className={styles.locationGrid}>
        <Panel title="Detected region" eyebrow="LOW-LATENCY POOL" className={styles.radarPanel}>
          <div className={styles.radar}>
            <span />
            <strong>NG</strong>
          </div>
          <div className={styles.radarCopy}>
            <strong>West Africa</strong>
            <small>Estimated matchmaking latency: 32–58ms</small>
          </div>
        </Panel>

        <div className={styles.formGrid}>
          <Field label="COUNTRY" value="Nigeria" />
          <Field label="STATE / REGION" value="Lagos" />
          <Field label="CITY" value="Lagos" />
          <Field label="TIMEZONE" value="Africa/Lagos · GMT+1" />
        </div>
      </div>

      <div className={styles.privacyBar}>
        <strong>PRIVATE BY DEFAULT</strong>
        <span>Your precise location is never shown publicly.</span>
      </div>
    </>
  );
}

function IdentityContent() {
  return (
    <>
      <Heading
        eyebrow="CLAIM YOUR PLAYER IDENTITY"
        title="How should players know you?"
        copy="Create the identity shown in rankings, matches, Crew activity, and your public player card."
      />

      <div className={styles.identityLayout}>
        <Panel
          title="Player card preview"
          eyebrow="LIVE PREVIEW"
          className={styles.playerCardPanel}
        >
          <div className={styles.playerCard}>
            <div className={styles.avatar}>FX</div>
            <div>
              <span>ROOKIE · LV. 01</span>
              <strong>FESENWA</strong>
              <small>EA FC · PlayStation · Lagos</small>
            </div>
            <b>0 XP</b>
          </div>
        </Panel>

        <div className={styles.formGrid}>
          <Field label="VERZUS GAMER TAG" value="FESENWA" helper="Available · 7 of 24 characters" />
          <Field label="PRIMARY PLATFORM" value="PlayStation" />
          <Field label="PLATFORM ID" value="Fesenwa_01" helper="Used for match verification" />
          <Field label="PLAYER STYLE" value="Competitive" />
        </div>
      </div>
    </>
  );
}

function AvailabilityContent({ viewport }: { viewport: Viewport }) {
  const days = [
    ["MON", true],
    ["TUE", true],
    ["WED", false],
    ["THU", true],
    ["FRI", true],
    ["SAT", true],
    ["SUN", false],
  ] as const;

  return (
    <>
      <Heading
        eyebrow="MAKE EVERY MATCH COUNT"
        title="When can you compete?"
        copy="Set your usual local-time availability. Match offers will prioritize these windows."
      />

      <div className={styles.timezoneBar}>
        <span>TIMEZONE</span>
        <strong>Africa/Lagos · GMT+1</strong>
      </div>

      <div className={styles.schedulerLayout}>
        <Panel title="Weekly availability" eyebrow="SELECT DAYS">
          <div className={styles.dayGrid}>
            {days.map(([day, selected]) => (
              <button key={day} type="button" className={selected ? styles.dayActive : ""}>
                <span>{day}</span>
                <small>{selected ? "ACTIVE" : "OFF"}</small>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Monday windows" eyebrow="2 WINDOWS">
          <div className={styles.windowList}>
            <div>
              <span>AFTERNOON</span>
              <strong>2:00 PM — 5:00 PM</strong>
              <button type="button">EDIT</button>
            </div>
            <div>
              <span>EVENING</span>
              <strong>7:00 PM — 10:30 PM</strong>
              <button type="button">EDIT</button>
            </div>
          </div>
        </Panel>
      </div>

      {viewport === "desktop" ? (
        <div className={styles.quickGrid}>
          <Stat label="WEEKLY WINDOWS" value="10" />
          <Stat label="TOTAL HOURS" value="27.5" />
          <Stat label="MATCH FIT" value="HIGH" />
        </div>
      ) : null}
    </>
  );
}

function CrewContent() {
  return (
    <>
      <Heading
        eyebrow="COMPETE BETTER TOGETHER"
        title="Find your Crew."
        copy="Join a competitive group now or skip and decide after exploring VERZUS."
      />

      <div className={styles.crewGrid}>
        <article className={styles.crewCard}>
          <div className={styles.crewLogo}>LGE</div>
          <div className={styles.crewMain}>
            <div className={styles.crewTitle}>
              <div>
                <span>TOP MATCH · 92% FIT</span>
                <strong>LAGOS ELITE</strong>
              </div>
              <b>18 MEMBERS</b>
            </div>
            <p>Competitive EA FC Crew active in your timezone.</p>
            <div className={styles.tags}>
              <span>EA FC</span>
              <span>RANKED</span>
              <span>LAGOS</span>
            </div>
          </div>
        </article>

        <article className={styles.crewCard}>
          <div className={`${styles.crewLogo} ${styles.crewLogoAlt}`}>NSG</div>
          <div className={styles.crewMain}>
            <div className={styles.crewTitle}>
              <div>
                <span>STRONG MATCH · 84% FIT</span>
                <strong>NAIJA STRIKERS</strong>
              </div>
              <b>12 MEMBERS</b>
            </div>
            <p>Football-gaming Crew for competitive and social players.</p>
            <div className={styles.tags}>
              <span>EA FC</span>
              <span>eFOOTBALL</span>
              <span>WEST AFRICA</span>
            </div>
          </div>
        </article>
      </div>

      <div className={styles.skipNotice}>
        <strong>NOT READY TO JOIN?</strong>
        <span>Skip Crew safely. You can join or create one later.</span>
      </div>
    </>
  );
}

function CompleteContent({ viewport }: { viewport: Viewport }) {
  return (
    <>
      <div className={styles.completeHero}>
        <div className={styles.completeMark}>✓</div>
        <Heading
          eyebrow="SETUP COMPLETE"
          title="You're match ready."
          copy="Your competitive identity is active. Enter Play to see your next action, ranking, Crew activity, and opportunities."
        />
      </div>

      <div className={styles.completeGrid}>
        <Panel title="Player identity" eyebrow="ACTIVE">
          <div className={styles.playerCard}>
            <div className={styles.avatar}>FX</div>
            <div>
              <span>ROOKIE · LV. 01</span>
              <strong>FESENWA</strong>
              <small>EA FC · PlayStation · Lagos</small>
            </div>
          </div>
        </Panel>

        <Panel title="First mission" eyebrow="250 XP REWARD">
          <div className={styles.mission}>
            <strong>Complete your first ranked match</strong>
            <span>Reward: 250 XP + Rookie badge</span>
          </div>
        </Panel>
      </div>

      <div className={styles.completeStats}>
        <Stat label="GAME" value="EA FC" />
        <Stat label="REGION" value="WEST AFRICA" />
        <Stat label="AVAILABILITY" value="5 DAYS" />
        <Stat label="CREW" value="LAGOS ELITE" />
        {viewport === "desktop" ? <Stat label="STATUS" value="MATCH READY" /> : null}
      </div>
    </>
  );
}

function StepContent({ step, viewport }: { step: StepDefinition; viewport: Viewport }) {
  switch (step.id) {
    case "welcome":
      return <WelcomeContent viewport={viewport} />;
    case "games":
      return <GamesContent />;
    case "location":
      return <LocationContent />;
    case "identity":
      return <IdentityContent />;
    case "availability":
      return <AvailabilityContent viewport={viewport} />;
    case "crew":
      return <CrewContent />;
    case "complete":
      return <CompleteContent viewport={viewport} />;
  }
}

function ReferenceFrame({ viewport, step }: FrameProps) {
  const isDesktop = viewport === "desktop";

  return (
    <article className={styles.referenceCard} id={`${viewport}-${step.id}`}>
      <header className={styles.referenceHeader}>
        <div>
          <span>{isDesktop ? "1440PX DESKTOP REFERENCE" : "768PX TABLET REFERENCE"}</span>
          <h2>
            {step.number}. {step.title}
          </h2>
          <p>{step.purpose}</p>
        </div>
        <div className={styles.approvalBadge}>GENERATED · UNAPPROVED</div>
      </header>

      <div className={`${styles.stage} ${isDesktop ? styles.stageDesktop : styles.stageTablet}`}>
        <div
          className={`${styles.viewport} ${
            isDesktop ? styles.viewportDesktop : styles.viewportTablet
          }`}
        >
          <div className={styles.scanlines} />

          {isDesktop ? <StepRail current={step.number} /> : null}

          <div className={styles.appSurface}>
            <header className={styles.appHeader}>
              {isDesktop ? (
                <>
                  <div>
                    <span>PLAYER ONBOARDING</span>
                    <strong>STEP {step.number} OF 7</strong>
                  </div>
                  <div className={styles.headerStatus}>
                    <span>PROGRESS SAVED</span>
                    <b>ONLINE</b>
                  </div>
                </>
              ) : (
                <>
                  <Brand />
                  <Progress current={step.number} compact />
                </>
              )}
            </header>

            <main className={styles.appMain}>
              <div className={styles.contentColumn}>
                <StepContent step={step} viewport={viewport} />
              </div>

              {isDesktop ? (
                <aside className={styles.contextPanel}>
                  <span>STEP CONTEXT</span>
                  <h4>{step.title}</h4>
                  <p>{step.purpose}</p>

                  <div className={styles.contextBlock}>
                    <strong>SUPPORTED STATES</strong>
                    <p>{step.states}</p>
                  </div>

                  <div className={styles.contextBlock}>
                    <strong>DATA DEPENDENCIES</strong>
                    <p>{step.dependencies}</p>
                  </div>

                  <div className={styles.contextBlock}>
                    <strong>FAILURE ISOLATION</strong>
                    <p>
                      The current widget may fail without removing navigation, saved progress, or
                      the previous-step action.
                    </p>
                  </div>
                </aside>
              ) : null}
            </main>

            <footer className={styles.appFooter}>
              <SecondaryButton>{step.number === 1 ? "EXIT SETUP" : "BACK"}</SecondaryButton>
              <div className={styles.footerSave}>
                <span>✓</span>
                <small>Progress saved automatically</small>
              </div>
              <PrimaryButton>
                {step.id === "welcome"
                  ? "BEGIN SETUP"
                  : step.id === "availability"
                    ? "SAVE AVAILABILITY"
                    : step.id === "crew"
                      ? "JOIN LAGOS ELITE"
                      : step.id === "complete"
                        ? "ENTER VERZUS"
                        : "CONTINUE"}
              </PrimaryButton>
            </footer>
          </div>
        </div>
      </div>
    </article>
  );
}

function ViewportSection({ viewport }: { viewport: Viewport }) {
  const isDesktop = viewport === "desktop";

  return (
    <section className={styles.viewportSection}>
      <div className={styles.sectionHeading}>
        <div>
          <span>{isDesktop ? "DESKTOP SYSTEM" : "TABLET SYSTEM"}</span>
          <h2>{isDesktop ? "1440px onboarding references" : "768px onboarding references"}</h2>
          <p>
            {isDesktop
              ? "Desktop uses a persistent step rail, broad content canvas, isolated context panel, and fixed action footer."
              : "Tablet uses a focused two-column canvas with touch-sized controls and no compressed desktop navigation."}
          </p>
        </div>
        <strong>{isDesktop ? "1440 × 900" : "768 × 1024"}</strong>
      </div>

      <div className={styles.referenceGrid}>
        {steps.map((step) => (
          <ReferenceFrame key={`${viewport}-${step.id}`} viewport={viewport} step={step} />
        ))}
      </div>
    </section>
  );
}

export default function ResponsiveReferencesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <span>M4 · TABLET AND DESKTOP APPROVAL BOARD</span>
          <h1>VERZUS onboarding responsive references</h1>
          <p>
            Fourteen approval-only references: seven tablet layouts and seven desktop layouts. These
            are not final production onboarding routes.
          </p>
        </div>

        <div className={styles.introStats}>
          <Stat label="TABLET" value="7 SCREENS" />
          <Stat label="DESKTOP" value="7 SCREENS" />
          <Stat label="STATUS" value="UNAPPROVED" />
        </div>
      </section>

      <section className={styles.gate}>
        <strong>APPROVAL GATE ACTIVE</strong>
        <p>
          Generating references does not approve them and does not complete M4. Final onboarding
          implementation remains blocked until mobile, tablet, and desktop references are approved.
        </p>
      </section>

      <ViewportSection viewport="tablet" />
      <ViewportSection viewport="desktop" />
    </main>
  );
}
