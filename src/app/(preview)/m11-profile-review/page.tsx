// VERZUS M11.8 PROFILE RELEASE REVIEW HUB

import Link from "next/link";

import { getProfileReleaseConfig } from "@/features/profiles/release";

import styles from "./review.module.css";

const reviewCases = [
  {
    label: "Own profile",
    description: "Identity, Crew, competitive summary, availability and recent activity.",
    href: "/profile",
  },
  {
    label: "Public player profile",
    description: "Server-projected player identity with viewer-aware field redaction.",
    href: "/players/player-prismo",
  },
  {
    label: "Profile editing",
    description: "Validated player-controlled identity updates and restricted avatar handling.",
    href: "/profile/edit",
  },
  {
    label: "Match history",
    description: "Paginated mobile cards, semantic desktop table and detailed statistics.",
    href: "/profile/matches?page=2",
  },
  {
    label: "Identity insights",
    description: "Achievements, connected game identities and auditable trust history.",
    href: "/profile/achievements?trustPage=2#trust-history",
  },
  {
    label: "Privacy settings",
    description: "Profile visibility and field-level public disclosure controls.",
    href: "/profile/settings",
  },
  {
    label: "Empty profile",
    description: "Intentional identity-creation state without exposing incomplete data.",
    href: "/profile?accountScenario=empty",
  },
  {
    label: "Suspended profile",
    description: "Controlled account restriction while unrelated platform routes remain usable.",
    href: "/profile?accountScenario=suspended",
  },
  {
    label: "Blocked public profile",
    description: "Public profile content is withheld when the viewer relationship is blocked.",
    href: "/players/player-prismo?viewer=blocked",
  },
  {
    label: "Partial profile failure",
    description: "A failed Crew resource remains local while identity and navigation survive.",
    href: "/profile?resource=crew&scenario=error",
  },
] as const;

export default function M11ProfileReviewPage() {
  const config = getProfileReleaseConfig();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>M11.8 PLAYER PROFILE RELEASE REVIEW</span>
        <h1>Player identity approval</h1>
        <p>
          Review own and public permissions, validated editing, history, achievements, trust,
          privacy and controlled edge states before promoting the immutable M11 artifact.
        </p>
      </header>

      <section className={styles.meta} aria-label="Release metadata">
        <p>Environment: {config.appEnvironment}</p>
        <p>Release: {config.releaseSha}</p>
        <p>Profiles: {config.profilesEnabled ? "enabled" : "disabled"}</p>
        <p>Stage: 11.8</p>
      </section>

      <section className={styles.grid} aria-label="M11 review cases">
        {reviewCases.map((item) => (
          <article className={styles.card} key={item.href}>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <Link href={item.href}>Open review case</Link>
          </article>
        ))}
      </section>

      <section className={styles.checklist}>
        <h2>Release checklist</h2>
        <ul>
          <li>Own and public profiles expose different server-authorized projections.</li>
          <li>
            Sensitive location, trust, handle and availability fields remain hidden by policy.
          </li>
          <li>Long names and missing avatars do not collapse the identity layout.</li>
          <li>Profile editing validates fields and prevents accidental duplicate saves.</li>
          <li>
            Match history paginates deterministically and uses distinct mobile and desktop views.
          </li>
          <li>Privacy retries preserve one idempotent mutation and confirmed server state.</li>
          <li>Empty, suspended, blocked and partial-failure states remain intentional.</li>
          <li>390px, 768px and 1440px are free of page-level horizontal overflow.</li>
        </ul>
      </section>
    </main>
  );
}
