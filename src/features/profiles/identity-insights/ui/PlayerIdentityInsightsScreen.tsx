// VERZUS M11.6 ACHIEVEMENTS, GAME IDENTITIES AND TRUST HISTORY SCREEN

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge, type BadgeTone } from "@/components/primitives/badge";

import { ProfileInsightResourceError } from "../adapter/player-identity-insights.adapter";
import {
  profileAchievementsQueryOptions,
  profileGameIdentitiesQueryOptions,
  profileTrustHistoryQueryOptions,
} from "../api/player-identity-insights.query";
import type {
  ProfileAchievementCategoryFilter,
  ProfileAchievementEntry,
  ProfileAchievementStateFilter,
  ProfileGameIdentityEntry,
  ProfileInsightResourceName,
  ProfileInsightScenario,
  ProfileTrustHistoryEntry,
} from "../model/player-identity-insights.types";
import styles from "./PlayerIdentityInsightsScreen.module.css";

const achievementCategories: ProfileAchievementCategoryFilter[] = [
  "all",
  "competitive",
  "crew",
  "trust",
  "season",
];
const achievementStates: ProfileAchievementStateFilter[] = [
  "all",
  "unlocked",
  "in-progress",
  "locked",
];
const scenarios: ProfileInsightScenario[] = [
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
];

function asCategory(value: string | null): ProfileAchievementCategoryFilter {
  return achievementCategories.includes(value as ProfileAchievementCategoryFilter)
    ? (value as ProfileAchievementCategoryFilter)
    : "all";
}

function asState(value: string | null): ProfileAchievementStateFilter {
  return achievementStates.includes(value as ProfileAchievementStateFilter)
    ? (value as ProfileAchievementStateFilter)
    : "all";
}

function asScenario(value: string | null): ProfileInsightScenario {
  return scenarios.includes(value as ProfileInsightScenario)
    ? (value as ProfileInsightScenario)
    : "normal";
}

function asPage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function asTarget(value: string | null): ProfileInsightResourceName | undefined {
  if (value === "achievements" || value === "game-identities" || value === "trust-history") {
    return value;
  }
  return undefined;
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function QueryStateCard({
  title,
  error,
  isLoading,
  isFetching,
  hasData,
  onRetry,
}: {
  title: string;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  hasData: boolean;
  onRetry: () => void;
}) {
  if (isLoading && !hasData) {
    return (
      <section aria-live="polite" className={styles.stateCard} data-state="loading">
        <strong>Loading {title.toLowerCase()}</strong>
        <p>Confirmed profile data is being prepared.</p>
      </section>
    );
  }

  if (error && !hasData) {
    const resourceError =
      error instanceof ProfileInsightResourceError
        ? error
        : new ProfileInsightResourceError({
            code: "PROFILE_INSIGHT_UNKNOWN_ERROR",
            message: `${title} could not be loaded.`,
            requestId: "profile-insight-unknown",
            retryable: true,
          });

    return (
      <section aria-live="assertive" className={styles.stateCard} data-state="error">
        <strong>{resourceError.message}</strong>
        <p>Error ID: {resourceError.requestId}</p>
        {resourceError.retryable ? (
          <button type="button" onClick={onRetry}>
            Retry {title.toLowerCase()}
          </button>
        ) : null}
      </section>
    );
  }

  if (isFetching && hasData) {
    return (
      <p aria-live="polite" className={styles.refreshNote}>
        Refreshing {title.toLowerCase()} while confirmed data remains visible…
      </p>
    );
  }

  return null;
}

function rarityTone(rarity: ProfileAchievementEntry["rarity"]): BadgeTone {
  if (rarity === "legendary") return "warning";
  if (rarity === "epic") return "special";
  if (rarity === "rare") return "information";
  return "neutral";
}

function achievementStateTone(state: ProfileAchievementEntry["state"]): BadgeTone {
  if (state === "unlocked") return "positive";
  if (state === "in-progress") return "information";
  return "neutral";
}

function identityStatusTone(status: ProfileGameIdentityEntry["status"]): BadgeTone {
  if (status === "verified") return "positive";
  if (status === "pending") return "warning";
  return "negative";
}

function AchievementCard({ entry }: { entry: ProfileAchievementEntry }) {
  const progress = Math.min(100, Math.round((entry.progressCurrent / entry.progressTarget) * 100));
  return (
    <article className={styles.achievementCard} data-rarity={entry.rarity} data-state={entry.state}>
      <div className={styles.cardTopline}>
        <Badge tone={rarityTone(entry.rarity)} variant="soft">
          {titleCase(entry.rarity)}
        </Badge>
        <Badge tone={achievementStateTone(entry.state)} variant="outline">
          {titleCase(entry.state)}
        </Badge>
      </div>
      <div>
        <p>{titleCase(entry.category)}</p>
        <h3>{entry.title}</h3>
      </div>
      <p className={styles.description}>{entry.description}</p>
      <div className={styles.progressTrack} aria-label={`${entry.title} progress ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressLine}>
        <strong>{entry.progressLabel}</strong>
        <span>{progress}%</span>
      </div>
      <dl className={styles.detailList}>
        <div>
          <dt>Evidence</dt>
          <dd>{entry.evidenceLabel}</dd>
        </div>
        <div>
          <dt>{entry.unlockedAtLabel ? "Unlocked" : "Reward"}</dt>
          <dd>{entry.unlockedAtLabel ?? entry.rewardLabel ?? "No reward assigned"}</dd>
        </div>
      </dl>
    </article>
  );
}

function GameIdentityCard({ entry }: { entry: ProfileGameIdentityEntry }) {
  return (
    <article className={styles.gameIdentityCard}>
      <div className={styles.gameGlyph} aria-hidden="true">
        {entry.gameLabel.slice(0, 2).toUpperCase()}
      </div>
      <div className={styles.gameIdentityMain}>
        <div className={styles.cardTopline}>
          <div>
            <p>{entry.platformLabel}</p>
            <h3>{entry.gameLabel}</h3>
          </div>
          <Badge tone={identityStatusTone(entry.status)} variant="soft">
            {titleCase(entry.status)}
          </Badge>
        </div>
        <strong className={styles.handle}>{entry.handle}</strong>
        <div className={styles.gameIdentityStats}>
          <span>{entry.rankLabel}</span>
          <span>{entry.recordLabel}</span>
          <span>{titleCase(entry.visibility)} visibility</span>
        </div>
        <small>
          Linked {entry.linkedAtLabel}
          {entry.lastVerifiedAtLabel
            ? ` · Verified ${entry.lastVerifiedAtLabel}`
            : " · Verification pending"}
        </small>
      </div>
    </article>
  );
}

function TrustEvent({ entry }: { entry: ProfileTrustHistoryEntry }) {
  return (
    <li className={styles.trustEvent} data-event={entry.type}>
      <div className={styles.trustDelta} data-positive={entry.delta >= 0}>
        {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
      </div>
      <div>
        <div className={styles.cardTopline}>
          <strong>{entry.title}</strong>
          <span>{entry.occurredAtLabel}</span>
        </div>
        <p>{entry.detail}</p>
        <small>
          {entry.referenceLabel} · {entry.actorLabel} · Score {entry.scoreAfter}
        </small>
      </div>
    </li>
  );
}

export function PlayerIdentityInsightsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = asCategory(searchParams.get("achievementCategory"));
  const state = asState(searchParams.get("achievementState"));
  const achievementPage = asPage(searchParams.get("achievementPage"));
  const trustPage = asPage(searchParams.get("trustPage"));
  const scenario = asScenario(searchParams.get("scenario"));
  const target = asTarget(searchParams.get("resource"));

  const achievementQuery = useQuery(
    profileAchievementsQueryOptions({
      category,
      state,
      page: achievementPage,
      scenario: target === "achievements" ? scenario : "normal",
    }),
  );
  const gameIdentityQuery = useQuery(
    profileGameIdentitiesQueryOptions({
      scenario: target === "game-identities" ? scenario : "normal",
    }),
  );
  const trustQuery = useQuery(
    profileTrustHistoryQueryOptions({
      page: trustPage,
      scenario: target === "trust-history" ? scenario : "normal",
    }),
  );

  const updateSearch = (changes: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const achievements = achievementQuery.data;
  const gameIdentities = gameIdentityQuery.data;
  const trust = trustQuery.data;

  return (
    <main className={styles.page} data-m11-stage="11.6" data-profile-scope="own">
      <header className={styles.pageHeader}>
        <div>
          <p>Season Zero · Identity record</p>
          <h1>Player progression</h1>
          <span>Achievements, linked game identities and auditable trust history.</span>
        </div>
        <Link href="/profile">Back to profile</Link>
      </header>

      <nav aria-label="Player progression sections" className={styles.sectionNav}>
        <a href="#achievements">Achievements</a>
        <a href="#game-identities">Game identities</a>
        <a href="#trust-history">Trust history</a>
      </nav>

      <section aria-labelledby="achievement-title" className={styles.panel} id="achievements">
        <div className={styles.panelHeading}>
          <div>
            <p>Confirmed milestones</p>
            <h2 id="achievement-title">Achievements</h2>
          </div>
          <div className={styles.headingBadges}>
            {achievements?.freshness === "stale" ? <Badge tone="warning">Stale</Badge> : null}
            <Badge tone="positive" variant="soft">
              {achievements?.unlockedCount ?? 0} unlocked
            </Badge>
          </div>
        </div>

        <div className={styles.filterGroup} aria-label="Achievement category filters">
          {achievementCategories.map((item) => (
            <button
              aria-pressed={category === item}
              key={item}
              onClick={() => updateSearch({ achievementCategory: item, achievementPage: 1 })}
              type="button"
            >
              {titleCase(item)}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup} aria-label="Achievement state filters">
          {achievementStates.map((item) => (
            <button
              aria-pressed={state === item}
              key={item}
              onClick={() => updateSearch({ achievementState: item, achievementPage: 1 })}
              type="button"
            >
              {titleCase(item)}
            </button>
          ))}
        </div>

        <QueryStateCard
          error={achievementQuery.error}
          hasData={Boolean(achievements)}
          isFetching={achievementQuery.isFetching}
          isLoading={achievementQuery.isLoading}
          onRetry={() => void achievementQuery.refetch()}
          title="Achievements"
        />

        {achievements ? (
          achievements.entries.length > 0 ? (
            <>
              <div className={styles.achievementGrid}>
                {achievements.entries.map((entry) => (
                  <AchievementCard entry={entry} key={entry.id} />
                ))}
              </div>
              <div className={styles.pagination}>
                <button
                  disabled={achievements.page <= 1}
                  onClick={() => updateSearch({ achievementPage: achievements.page - 1 })}
                  type="button"
                >
                  Previous
                </button>
                <span>
                  Page {achievements.page} of {Math.max(achievements.totalPages, 1)}
                </span>
                <button
                  disabled={achievements.page >= achievements.totalPages}
                  onClick={() => updateSearch({ achievementPage: achievements.page + 1 })}
                  type="button"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <strong>No achievements match these filters.</strong>
              <p>Reset the filters to review the complete achievement record.</p>
              <button
                onClick={() =>
                  updateSearch({
                    achievementCategory: "all",
                    achievementState: "all",
                    achievementPage: 1,
                  })
                }
                type="button"
              >
                Reset filters
              </button>
            </div>
          )
        ) : null}
      </section>

      <section
        aria-labelledby="game-identities-title"
        className={styles.panel}
        id="game-identities"
      >
        <div className={styles.panelHeading}>
          <div>
            <p>Connected platforms</p>
            <h2 id="game-identities-title">Game identities</h2>
          </div>
          <div className={styles.headingBadges}>
            {gameIdentities?.freshness === "stale" ? <Badge tone="warning">Stale</Badge> : null}
            <Badge tone="information" variant="soft">
              {gameIdentities?.verifiedCount ?? 0} verified
            </Badge>
          </div>
        </div>

        <QueryStateCard
          error={gameIdentityQuery.error}
          hasData={Boolean(gameIdentities)}
          isFetching={gameIdentityQuery.isFetching}
          isLoading={gameIdentityQuery.isLoading}
          onRetry={() => void gameIdentityQuery.refetch()}
          title="Game identities"
        />

        {gameIdentities ? (
          gameIdentities.entries.length > 0 ? (
            <div className={styles.gameIdentityGrid}>
              {gameIdentities.entries.map((entry) => (
                <GameIdentityCard entry={entry} key={entry.id} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>No game identity is connected.</strong>
              <p>Connect a supported game account from profile settings.</p>
            </div>
          )
        ) : null}
      </section>

      <section aria-labelledby="trust-history-title" className={styles.panel} id="trust-history">
        <div className={styles.panelHeading}>
          <div>
            <p>Auditable conduct record</p>
            <h2 id="trust-history-title">Trust history</h2>
          </div>
          <div className={styles.headingBadges}>
            {trust?.freshness === "stale" ? <Badge tone="warning">Stale</Badge> : null}
            <Badge tone="positive" variant="soft">
              {trust?.score ?? 0} trust
            </Badge>
          </div>
        </div>

        <QueryStateCard
          error={trustQuery.error}
          hasData={Boolean(trust)}
          isFetching={trustQuery.isFetching}
          isLoading={trustQuery.isLoading}
          onRetry={() => void trustQuery.refetch()}
          title="Trust history"
        />

        {trust ? (
          <>
            <div className={styles.trustSummary}>
              <div className={styles.trustScore}>
                <span>{trust.score}</span>
                <strong>{trust.statusLabel}</strong>
                <small>{trust.trend >= 0 ? `+${trust.trend}` : trust.trend} this season</small>
              </div>
              <div className={styles.trustCategories}>
                {trust.categories.map((categoryEntry) => (
                  <article key={categoryEntry.id}>
                    <div>
                      <strong>{categoryEntry.label}</strong>
                      <span>{categoryEntry.score}</span>
                    </div>
                    <div className={styles.categoryTrack}>
                      <span style={{ width: `${categoryEntry.score}%` }} />
                    </div>
                    <p>{categoryEntry.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            {trust.entries.length > 0 ? (
              <>
                <ol className={styles.trustTimeline}>
                  {trust.entries.map((entry) => (
                    <TrustEvent entry={entry} key={entry.id} />
                  ))}
                </ol>
                <div className={styles.pagination}>
                  <button
                    disabled={trust.page <= 1}
                    onClick={() => updateSearch({ trustPage: trust.page - 1 })}
                    type="button"
                  >
                    Previous
                  </button>
                  <span>
                    Page {trust.page} of {Math.max(trust.totalPages, 1)}
                  </span>
                  <button
                    disabled={trust.page >= trust.totalPages}
                    onClick={() => updateSearch({ trustPage: trust.page + 1 })}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <strong>No trust events are available.</strong>
                <p>The current trust score remains visible while the event ledger is empty.</p>
              </div>
            )}
          </>
        ) : null}
      </section>

      <aside className={styles.stageNotice}>
        <strong>Owner-only identity record</strong>
        <p>
          Public profiles receive only server-authorized summaries. Full trust events, private game
          identities and achievement evidence remain restricted to the profile owner.
        </p>
      </aside>
    </main>
  );
}
