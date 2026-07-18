// VERZUS M10.8 REWARD RELEASE REVIEW HUB

import Link from "next/link";

import { getRewardReleaseConfig } from "@/features/rewards/release";

import styles from "./review.module.css";

const reviewCases = [
  {
    label: "Rewards overview",
    description: "Level progress, claimable reward, season track and recent reward history.",
    href: "/rewards",
  },
  {
    label: "No rewards",
    description: "Intentional empty inventory while progression and navigation remain available.",
    href: "/rewards?resource=inventory&scenario=empty#reward-inventory",
  },
  {
    label: "Claim response lost",
    description: "A confirmed server grant can be retried safely without duplicating the reward.",
    href: "/rewards?claimScenario=response-lost",
  },
  {
    label: "Claim failure",
    description: "Retryable claim failure leaves server inventory authoritative and unchanged.",
    href: "/rewards?claimScenario=error",
  },
  {
    label: "Season unavailable",
    description: "Season failure remains local while inventory, history and claim actions survive.",
    href: "/rewards?resource=season&scenario=error",
  },
  {
    label: "Achievement detail",
    description: "Verified achievement provenance, requirement progress and linked reward detail.",
    href: "/rewards?achievement=achievement-weekly-warrior#achievement-detail",
  },
  {
    label: "Reward audit history",
    description: "Paginated issued, claimed, expired and revoked reward events with references.",
    href: "/rewards?historyPage=2#reward-audit-history",
  },
  {
    label: "Widget isolation",
    description: "An inventory widget crash is contained without removing the Rewards route.",
    href: "/rewards?widget=inventory&widgetScenario=crash",
  },
] as const;

export default function M10RewardsReviewPage() {
  const config = getRewardReleaseConfig();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>M10.8 REWARDS RELEASE REVIEW</span>
        <h1>Rewards and progression approval</h1>
        <p>
          Review safe claiming, progression, achievements, history, failure isolation and responsive
          containment before promoting the immutable M10 artifact.
        </p>
      </header>

      <section className={styles.meta} aria-label="Release metadata">
        <p>Environment: {config.appEnvironment}</p>
        <p>Release: {config.releaseSha}</p>
        <p>Rewards: {config.rewardsEnabled ? "enabled" : "disabled"}</p>
        <p>Stage: 10.8</p>
      </section>

      <section className={styles.grid} aria-label="M10 review cases">
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
          <li>Claim commands require stable idempotency keys and expected inventory versions.</li>
          <li>A retried request cannot duplicate coins, XP, boosts, crates or cosmetics.</li>
          <li>Claim confirmation remains visible after a response-loss retry.</li>
          <li>Expired and revoked rewards expose their server-confirmed reasons.</li>
          <li>One failed resource or widget does not remove unrelated reward functions.</li>
          <li>The 390px reference remains visually faithful and free of horizontal overflow.</li>
          <li>
            768px and 1440px preserve safe containment until dedicated references are approved.
          </li>
          <li>Keyboard focus, labels, reduced motion and claim feedback remain usable.</li>
        </ul>
      </section>
    </main>
  );
}
