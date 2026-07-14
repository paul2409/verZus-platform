// VERZUS M4 ONBOARDING MOBILE REFERENCES

import type { Metadata } from "next";

import styles from "./onboarding-references.module.css";

export const metadata: Metadata = {
  title: "M4 Onboarding References | VERZUS",
  description: "Approval-only 390px onboarding visual references for VERZUS M4.",
  robots: {
    index: false,
    follow: false,
  },
};

interface StepFrameProps {
  number: number;
  title: string;
  purpose: string;
  children: React.ReactNode;
}

interface ChoiceCardProps {
  title: string;
  detail: string;
  selected?: boolean;
  badge?: string;
}

const onboardingSteps = [
  {
    number: 1,
    label: "Welcome",
    states: "loading, success, stale, offline, maintenance",
    dependencies: "saved onboarding progress, player display name",
  },
  {
    number: 2,
    label: "Choose games",
    states: "loading, success, empty, error, partial failure",
    dependencies: "game catalog, platform support, saved selections",
  },
  {
    number: 3,
    label: "Select location",
    states: "loading, success, empty, error, offline",
    dependencies: "countries, regions, cities, timezone",
  },
  {
    number: 4,
    label: "Player identity",
    states: "loading, success, validation error, duplicate gamer tag",
    dependencies: "gamer-tag rules, platform identities",
  },
  {
    number: 5,
    label: "Availability",
    states: "loading, success, empty schedule, partial failure",
    dependencies: "timezone, days, time windows, slot rules",
  },
  {
    number: 6,
    label: "Crew preference",
    states: "loading, success, empty, error, partial failure",
    dependencies: "Crew suggestions, game compatibility, skip option",
  },
  {
    number: 7,
    label: "Complete",
    states: "success, retrying, error, session expired",
    dependencies: "server-authoritative onboarding completion",
  },
] as const;

function StepProgress({ current }: { current: number }) {
  return (
    <div className={styles.progress} aria-label={`Step ${current} of 7`}>
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

function BrandMark() {
  return (
    <div className={styles.brandRow}>
      <div className={styles.brandMark}>V</div>
      <div>
        <strong>VERZUS</strong>
        <span>COMPETE. RISE. BELONG.</span>
      </div>
    </div>
  );
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.device}>
      <div className={styles.deviceNotch} />
      <div className={styles.deviceScreen}>
        <div className={styles.scanlines} />
        {children}
      </div>
    </div>
  );
}

function StepFrame({ number, title, purpose, children }: StepFrameProps) {
  return (
    <article className={styles.referenceCard} id={`step-${number}`}>
      <header className={styles.referenceHeader}>
        <div>
          <span>390PX MOBILE REFERENCE</span>
          <h2>
            {number}. {title}
          </h2>
          <p>{purpose}</p>
        </div>
        <div className={styles.referenceBadge}>APPROVAL REQUIRED</div>
      </header>

      <MobileShell>{children}</MobileShell>
    </article>
  );
}

function ReferenceTop({ current }: { current: number }) {
  return (
    <>
      <BrandMark />
      <StepProgress current={current} />
    </>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className={styles.primaryButton} type="button">
      {children}
      <span aria-hidden="true">›</span>
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className={styles.secondaryButton} type="button">
      {children}
    </button>
  );
}

function ChoiceCard({ title, detail, selected = false, badge }: ChoiceCardProps) {
  return (
    <button
      className={`${styles.choiceCard} ${selected ? styles.choiceSelected : ""}`}
      type="button"
      aria-pressed={selected}
    >
      <span className={styles.choiceIcon}>{title.slice(0, 2).toUpperCase()}</span>
      <span className={styles.choiceCopy}>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      {badge ? <span className={styles.choiceBadge}>{badge}</span> : null}
      <span className={styles.choiceCheck}>{selected ? "✓" : "+"}</span>
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

function WelcomeReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={1} />

      <div className={styles.heroOrb}>
        <span className={styles.heroRingOne} />
        <span className={styles.heroRingTwo} />
        <strong>V</strong>
      </div>

      <div className={styles.heroCopy}>
        <span className={styles.kicker}>YOUR COMPETITIVE IDENTITY STARTS HERE</span>
        <h3>Build your player profile.</h3>
        <p>
          Set up the essentials VERZUS needs to match you with the right games, opponents,
          opportunities, and Crew.
        </p>
      </div>

      <div className={styles.benefitGrid}>
        <div>
          <strong>SMART MATCHES</strong>
          <span>Based on your game and region</span>
        </div>
        <div>
          <strong>LIVE RANKING</strong>
          <span>Your progress follows every result</span>
        </div>
        <div>
          <strong>CREW READY</strong>
          <span>Join players who fit your style</span>
        </div>
      </div>

      <div className={styles.resumeNote}>
        <span>✓</span>
        <p>Your progress saves automatically. Leave and resume anytime.</p>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>BEGIN SETUP</PrimaryButton>
        <small>About 3 minutes</small>
      </div>
    </div>
  );
}

function GamesReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={2} />

      <div className={styles.screenHeading}>
        <span className={styles.kicker}>BUILD YOUR COMPETITIVE POOL</span>
        <h3>What do you play?</h3>
        <p>Choose every game you want to compete in. You can update this later.</p>
      </div>

      <div className={styles.selectionSummary}>
        <strong>1 SELECTED</strong>
        <span>Choose up to 5</span>
      </div>

      <div className={styles.choiceList}>
        <ChoiceCard
          title="EA SPORTS FC"
          detail="PlayStation · Xbox · PC"
          selected
          badge="RECOMMENDED"
        />
        <ChoiceCard title="eFootball" detail="Console · PC · Mobile" />
        <ChoiceCard title="NBA 2K" detail="PlayStation · Xbox · PC" />
        <ChoiceCard title="Call of Duty" detail="Console · PC · Mobile" />
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>CONTINUE</PrimaryButton>
        <SecondaryButton>BACK</SecondaryButton>
      </div>
    </div>
  );
}

function LocationReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={3} />

      <div className={styles.screenHeading}>
        <span className={styles.kicker}>COMPETE IN THE RIGHT REGION</span>
        <h3>Where are you based?</h3>
        <p>
          Location helps VERZUS improve match timing, latency, eligibility, and local competition.
        </p>
      </div>

      <div className={styles.radarPanel}>
        <div className={styles.radarCircle}>
          <span />
          <strong>NG</strong>
        </div>
        <div>
          <span>REGION DETECTED</span>
          <strong>West Africa</strong>
          <small>Low-latency pool available</small>
        </div>
      </div>

      <div className={styles.formStack}>
        <Field label="COUNTRY" value="Nigeria" />
        <Field label="STATE / REGION" value="Lagos" />
        <Field
          label="CITY"
          value="Lagos"
          helper="Used only for matchmaking and event eligibility"
        />
        <Field label="TIMEZONE" value="Africa/Lagos · GMT+1" />
      </div>

      <div className={styles.privacyNote}>
        <span>LOCKED</span>
        <p>Your exact location is never shown publicly.</p>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>CONTINUE</PrimaryButton>
        <SecondaryButton>BACK</SecondaryButton>
      </div>
    </div>
  );
}

function IdentityReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={4} />

      <div className={styles.screenHeading}>
        <span className={styles.kicker}>CLAIM YOUR PLAYER IDENTITY</span>
        <h3>How should players know you?</h3>
        <p>Create the public identity that appears in rankings, matches, and Crew activity.</p>
      </div>

      <div className={styles.identityPreview}>
        <div className={styles.avatar}>FX</div>
        <div>
          <span>PLAYER CARD PREVIEW</span>
          <strong>FESENWA</strong>
          <small>EA FC · Lagos · Rookie</small>
        </div>
        <b>LV. 01</b>
      </div>

      <div className={styles.formStack}>
        <Field label="VERZUS GAMER TAG" value="FESENWA" helper="Available · 7 of 24 characters" />
        <Field label="PRIMARY PLATFORM" value="PlayStation" />
        <Field
          label="PLATFORM ID"
          value="Fesenwa_01"
          helper="Your PSN ID is used for match verification"
        />
      </div>

      <div className={styles.rolePicker}>
        <span>PLAYER STYLE</span>
        <div>
          <button type="button" className={styles.roleSelected}>
            Competitive
          </button>
          <button type="button">Social</button>
          <button type="button">Both</button>
        </div>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>CONTINUE</PrimaryButton>
        <SecondaryButton>BACK</SecondaryButton>
      </div>
    </div>
  );
}

function AvailabilityReference() {
  const days = [
    ["M", true],
    ["T", true],
    ["W", false],
    ["T", true],
    ["F", true],
    ["S", true],
    ["S", false],
  ] as const;

  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={5} />

      <div className={styles.screenHeading}>
        <span className={styles.kicker}>MAKE EVERY MATCH COUNT</span>
        <h3>When can you compete?</h3>
        <p>Set your usual availability. Match offers will prioritize these windows.</p>
      </div>

      <div className={styles.timezoneBar}>
        <span>TIMEZONE</span>
        <strong>Africa/Lagos · GMT+1</strong>
      </div>

      <div className={styles.dayPicker}>
        {days.map(([day, selected], index) => (
          <button
            key={`${day}-${index}`}
            type="button"
            className={selected ? styles.daySelected : ""}
          >
            {day}
          </button>
        ))}
      </div>

      <div className={styles.windowPanel}>
        <div className={styles.windowHeader}>
          <div>
            <span>MONDAY</span>
            <strong>2 WINDOWS</strong>
          </div>
          <button type="button">+ ADD</button>
        </div>

        <div className={styles.timeWindow}>
          <span>AFTERNOON</span>
          <strong>2:00 PM — 5:00 PM</strong>
          <button type="button">×</button>
        </div>

        <div className={styles.timeWindow}>
          <span>EVENING</span>
          <strong>7:00 PM — 10:30 PM</strong>
          <button type="button">×</button>
        </div>
      </div>

      <div className={styles.quickSelect}>
        <span>QUICK SELECT</span>
        <div>
          <button type="button">Weeknights</button>
          <button type="button">Weekends</button>
          <button type="button">Flexible</button>
        </div>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>SAVE AVAILABILITY</PrimaryButton>
        <SecondaryButton>BACK</SecondaryButton>
      </div>
    </div>
  );
}

function CrewReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={6} />

      <div className={styles.screenHeading}>
        <span className={styles.kicker}>COMPETE BETTER TOGETHER</span>
        <h3>Find your Crew.</h3>
        <p>Join a competitive group now or skip and decide after exploring VERZUS.</p>
      </div>

      <div className={styles.crewMatch}>
        <span>TOP MATCH</span>
        <strong>92% FIT</strong>
      </div>

      <div className={styles.crewCard}>
        <div className={styles.crewLogo}>LGE</div>
        <div className={styles.crewCopy}>
          <div>
            <strong>LAGOS ELITE</strong>
            <span>18 MEMBERS</span>
          </div>
          <p>Competitive EA FC Crew active in your timezone.</p>
          <div className={styles.crewTags}>
            <span>EA FC</span>
            <span>RANKED</span>
            <span>LAGOS</span>
          </div>
        </div>
      </div>

      <div className={styles.crewCard}>
        <div className={styles.crewLogoAlt}>NSG</div>
        <div className={styles.crewCopy}>
          <div>
            <strong>NAIJA STRIKERS</strong>
            <span>12 MEMBERS</span>
          </div>
          <p>Football-gaming Crew for competitive and social players.</p>
          <div className={styles.crewTags}>
            <span>EA FC</span>
            <span>eFOOTBALL</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>JOIN LAGOS ELITE</PrimaryButton>
        <SecondaryButton>SKIP CREW FOR NOW</SecondaryButton>
        <small>You can join or create a Crew later</small>
      </div>
    </div>
  );
}

function CompleteReference() {
  return (
    <div className={styles.screenContent}>
      <ReferenceTop current={7} />

      <div className={styles.completeMark}>
        <div>
          <span>✓</span>
        </div>
        <strong>SETUP COMPLETE</strong>
      </div>

      <div className={styles.heroCopy}>
        <span className={styles.kicker}>YOUR VERZUS JOURNEY STARTS NOW</span>
        <h3>You&apos;re match ready.</h3>
        <p>
          Your competitive identity is active. Enter Play to see your next action, ranking, Crew
          activity, and open opportunities.
        </p>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.avatar}>FX</div>
        <div>
          <span>PLAYER IDENTITY</span>
          <strong>FESENWA</strong>
          <small>EA FC · PlayStation · Lagos</small>
        </div>
      </div>

      <div className={styles.completionGrid}>
        <div>
          <span>GAME</span>
          <strong>EA FC</strong>
        </div>
        <div>
          <span>REGION</span>
          <strong>WEST AFRICA</strong>
        </div>
        <div>
          <span>AVAILABILITY</span>
          <strong>5 DAYS</strong>
        </div>
        <div>
          <span>CREW</span>
          <strong>LAGOS ELITE</strong>
        </div>
      </div>

      <div className={styles.firstMission}>
        <span>FIRST MISSION</span>
        <strong>Complete your first ranked match</strong>
        <small>Reward: 250 XP + Rookie badge</small>
      </div>

      <div className={styles.bottomActions}>
        <PrimaryButton>ENTER VERZUS</PrimaryButton>
        <small>Destination: Play command centre</small>
      </div>
    </div>
  );
}

export default function M4OnboardingReferencesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <span className={styles.kicker}>M4 · MOBILE-FIRST APPROVAL BOARD</span>
          <h1>VERZUS onboarding references</h1>
          <p>
            Seven approval-only 390px references. These are not final onboarding routes and contain
            no production submission logic.
          </p>
        </div>

        <div className={styles.introStatus}>
          <strong>390PX</strong>
          <span>MOBILE REVIEW</span>
        </div>
      </section>

      <section className={styles.gateNotice}>
        <strong>IMPLEMENTATION GATE ACTIVE</strong>
        <p>
          Review and approve these mobile references first. Tablet and desktop references remain
          blocked.
        </p>
      </section>

      <nav className={styles.stepNav} aria-label="Onboarding references">
        {onboardingSteps.map((step) => (
          <a key={step.number} href={`#step-${step.number}`}>
            <span>{step.number}</span>
            {step.label}
          </a>
        ))}
      </nav>

      <section className={styles.contractGrid}>
        {onboardingSteps.map((step) => (
          <article key={step.number}>
            <span>STEP {step.number}</span>
            <strong>{step.label}</strong>
            <small>States: {step.states}</small>
            <small>Data: {step.dependencies}</small>
          </article>
        ))}
      </section>

      <section className={styles.references}>
        <StepFrame
          number={1}
          title="Onboarding welcome"
          purpose="Explain the value of setup, establish progress saving, and begin onboarding."
        >
          <WelcomeReference />
        </StepFrame>

        <StepFrame
          number={2}
          title="Choose games"
          purpose="Select the game catalog used for matchmaking, ranking, and opportunities."
        >
          <GamesReference />
        </StepFrame>

        <StepFrame
          number={3}
          title="Select location"
          purpose="Collect region and timezone data without exposing a precise public location."
        >
          <LocationReference />
        </StepFrame>

        <StepFrame
          number={4}
          title="Create player identity"
          purpose="Create the public gamer tag, platform identity, and player style."
        >
          <IdentityReference />
        </StepFrame>

        <StepFrame
          number={5}
          title="Set availability"
          purpose="Capture recurring match windows in the player's local timezone."
        >
          <AvailabilityReference />
        </StepFrame>

        <StepFrame
          number={6}
          title="Join or skip Crew"
          purpose="Recommend compatible Crews while keeping the skip path visible and safe."
        >
          <CrewReference />
        </StepFrame>

        <StepFrame
          number={7}
          title="Onboarding complete"
          purpose="Confirm server-authoritative completion and direct the player into Play."
        >
          <CompleteReference />
        </StepFrame>
      </section>
    </main>
  );
}
