// VERZUS M11.2 PUBLIC PROFILE PRESENTATION

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/primitives/badge";

import type {
  PublicGameIdentityView,
  PublicPlayerProfileViewModel,
  PublicProfileMatchRecord,
} from "../model/public-player-profile.types";
import styles from "./PlayerPublicProfileScreen.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");

function initialsFor(displayName: string): string {
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function PublicAvatar({ model }: { model: PublicPlayerProfileViewModel }) {
  return (
    <div className={styles.avatarWrap}>
      {model.identity.avatarSrc ? (
        <Image
          alt={model.identity.avatarAlt}
          className={styles.avatar}
          height={112}
          priority
          src={model.identity.avatarSrc}
          width={112}
        />
      ) : (
        <span
          aria-label={`${model.identity.displayName} avatar fallback`}
          className={styles.avatarFallback}
        >
          {initialsFor(model.identity.displayName)}
        </span>
      )}
      {model.identity.verified ? (
        <span aria-label="Verified player" className={styles.verifiedMark}>
          ✓
        </span>
      ) : null}
    </div>
  );
}

function AccessNotice({ model }: { model: PublicPlayerProfileViewModel }) {
  const copy =
    model.viewerMode === "owner"
      ? "You are reviewing the public representation of your profile. Private controls remain on your own profile."
      : model.viewerMode === "friend"
        ? "Friend-level fields are visible because the server-authorized viewer relationship permits them."
        : "Only fields allowed by this player's privacy policy are included in this public view.";

  return (
    <aside className={styles.accessNotice} data-access={model.access}>
      <div>
        <strong>
          {model.access === "full" ? "Permission-aware profile" : "Restricted profile"}
        </strong>
        <p>{copy}</p>
      </div>
      <Badge tone={model.access === "full" ? "positive" : "warning"} variant="soft">
        {model.viewerMode}
      </Badge>
    </aside>
  );
}

function RestrictedProfile({ model }: { model: PublicPlayerProfileViewModel }) {
  const blocked = model.access === "blocked";

  return (
    <main
      className={styles.page}
      data-m11-stage="11.2"
      data-profile-access={model.access}
      data-profile-scope="public"
    >
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Season Zero · Public profile</p>
          <h1>Player profile</h1>
        </div>
        <Badge tone={blocked ? "negative" : "warning"} variant="outline">
          {blocked ? "Blocked" : model.identity.visibility}
        </Badge>
      </header>

      <section className={styles.restrictedCard}>
        <span aria-hidden="true" className={styles.restrictedGlyph}>
          {blocked ? "⊘" : "◇"}
        </span>
        <p>{model.identity.handle}</p>
        <h2>{blocked ? "Profile unavailable" : "This profile is restricted"}</h2>
        <p>
          {blocked
            ? "This viewer relationship cannot access the player profile. No private profile data was sent to this screen."
            : "The player shares profile details only with approved viewers. Public identity is intentionally limited."}
        </p>
        <Link className={styles.secondaryAction} href="/leaderboards/weekly">
          Return to leaderboards
        </Link>
      </section>
    </main>
  );
}

function StatPanel({ model }: { model: PublicPlayerProfileViewModel }) {
  if (!model.stats) {
    return (
      <section className={styles.redactedPanel}>
        <strong>Statistics are private</strong>
        <p>The server projection did not include competitive statistics for this viewer.</p>
      </section>
    );
  }

  const items = [
    ["Matches", numberFormatter.format(model.stats.matches)],
    ["Win rate", model.stats.winRateLabel],
    ["Rating", numberFormatter.format(model.stats.rating)],
    ["Trust", model.stats.trustScore === null ? "Private" : `${model.stats.trustScore}`],
  ] as const;

  return (
    <section aria-labelledby="public-stats-title" className={styles.panel} id="statistics">
      <div className={styles.sectionHeading}>
        <div>
          <p>Confirmed record</p>
          <h2 id="public-stats-title">Competitive statistics</h2>
        </div>
        <Badge tone="positive" variant="soft">
          {model.stats.currentStreakLabel} streak
        </Badge>
      </div>
      <dl className={styles.statGrid}>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.recordLine}>
        <span>{model.stats.wins} wins</span>
        <span>{model.stats.losses} losses</span>
        <span>{model.stats.draws} draws</span>
        <span>#{model.stats.weeklyRank} weekly</span>
      </div>
    </section>
  );
}

function GameRow({ game }: { game: PublicGameIdentityView }) {
  return (
    <li className={styles.gameRow}>
      <span aria-hidden="true" className={styles.gameGlyph}>
        {game.gameLabel.slice(0, 2).toUpperCase()}
      </span>
      <div>
        <strong>{game.gameLabel}</strong>
        <span>
          {game.handle ?? "Handle hidden"} · {game.platformLabel}
        </span>
      </div>
      <p>
        <strong>{game.rankLabel}</strong>
        <span>{game.verified ? "Verified" : "Pending"}</span>
      </p>
    </li>
  );
}

function MatchRow({ match }: { match: PublicProfileMatchRecord }) {
  const resultLabel =
    match.result === "win" ? "Victory" : match.result === "loss" ? "Defeat" : "Draw";

  return (
    <li>
      <Link className={styles.matchRow} href={match.href}>
        <span className={styles.matchResult} data-result={match.result}>
          {resultLabel}
        </span>
        <div>
          <strong>vs {match.opponentLabel}</strong>
          <span>
            {match.gameLabel} · {match.competitionLabel}
          </span>
        </div>
        <p>
          <strong>{match.scoreLabel}</strong>
          <span>{match.playedAtLabel}</span>
        </p>
      </Link>
    </li>
  );
}

export function PlayerPublicProfileScreen({ model }: { model: PublicPlayerProfileViewModel }) {
  if (model.access !== "full") return <RestrictedProfile model={model} />;

  return (
    <main
      className={styles.page}
      data-m11-stage="11.2"
      data-profile-access={model.access}
      data-profile-scope="public"
      data-viewer-mode={model.viewerMode}
    >
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Season Zero · Public profile</p>
          <h1>Player profile</h1>
        </div>
        <Badge tone="information" variant="outline">
          Public view
        </Badge>
      </header>

      <AccessNotice model={model} />

      <section aria-labelledby="public-profile-name" className={styles.identityCard}>
        <div
          className={styles.banner}
          style={{ backgroundImage: `url(${model.identity.bannerSrc})` }}
        />
        <div className={styles.identityBody}>
          <PublicAvatar model={model} />
          <div className={styles.identityHeading}>
            <div className={styles.nameRow}>
              <h2 id="public-profile-name">{model.identity.displayName}</h2>
              <Badge tone="special" variant="outline">
                Public
              </Badge>
            </div>
            <p className={styles.handle}>{model.identity.handle}</p>
            <p className={styles.playerTitle}>{model.identity.title}</p>
          </div>

          <div className={styles.identityBadges}>
            {model.identity.verified ? <Badge tone="positive">Verified</Badge> : null}
            {model.identity.locationLabel ? (
              <Badge tone="information" variant="outline">
                {model.identity.locationLabel}
              </Badge>
            ) : null}
            <Badge tone="special" variant="soft">
              {model.identity.visibility}
            </Badge>
          </div>

          {model.identity.bio ? <p className={styles.bio}>{model.identity.bio}</p> : null}

          <div className={styles.profileActions}>
            {model.permissions.canEdit ? (
              <Link className={styles.primaryAction} href="/profile">
                Open own profile
              </Link>
            ) : null}
            {model.crew ? (
              <Link className={styles.primaryAction} href={model.crew.href}>
                View Crew
              </Link>
            ) : null}
            <Link
              className={styles.secondaryAction}
              href={`/leaderboards/weekly?q=${encodeURIComponent(model.identity.displayName)}`}
            >
              Weekly ranking
            </Link>
          </div>
        </div>
      </section>

      <nav aria-label="Public profile sections" className={styles.sectionNav}>
        <a href="#overview">Overview</a>
        <a href="#statistics">Stats</a>
        <a href="#matches">Matches</a>
        <a href="#achievements">Achievements</a>
      </nav>

      <StatPanel model={model} />

      <div className={styles.contentGrid} id="overview">
        <section aria-labelledby="public-availability-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Competition readiness</p>
              <h2 id="public-availability-title">Availability</h2>
            </div>
          </div>
          {model.availability ? (
            <div className={styles.availabilityCard}>
              <strong>{model.availability.label}</strong>
              <p>
                {model.availability.detail ?? "Exact availability is shared with approved friends."}
              </p>
              {model.availability.nextWindowLabel ? (
                <span>{model.availability.nextWindowLabel}</span>
              ) : null}
            </div>
          ) : (
            <div className={styles.redactedInline}>Availability is private.</div>
          )}
        </section>

        <section aria-labelledby="public-crew-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Competitive team</p>
              <h2 id="public-crew-title">Crew</h2>
            </div>
          </div>
          {model.crew ? (
            <Link className={styles.crewCard} href={model.crew.href}>
              <span aria-hidden="true">{model.crew.tag}</span>
              <div>
                <strong>{model.crew.name}</strong>
                <p>
                  {model.crew.roleLabel} · {model.crew.tag}
                </p>
              </div>
              <b>Open</b>
            </Link>
          ) : (
            <div className={styles.redactedInline}>Crew membership is private or unavailable.</div>
          )}
        </section>

        <section aria-labelledby="public-games-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Connected platforms</p>
              <h2 id="public-games-title">Game identities</h2>
            </div>
            {!model.permissions.canViewGameHandles ? <span>Handles hidden</span> : null}
          </div>
          <ul className={styles.list}>
            {model.games.map((game) => (
              <GameRow game={game} key={game.id} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="public-matches-title" className={styles.panel} id="matches">
          <div className={styles.sectionHeading}>
            <div>
              <p>Verified results</p>
              <h2 id="public-matches-title">Recent matches</h2>
            </div>
          </div>
          {model.permissions.canViewMatchHistory ? (
            <ul className={styles.list}>
              {model.recentMatches.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </ul>
          ) : (
            <div className={styles.redactedInline}>Match history is private.</div>
          )}
        </section>

        <section
          aria-labelledby="public-achievements-title"
          className={styles.panel}
          id="achievements"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p>Milestones</p>
              <h2 id="public-achievements-title">Achievements</h2>
            </div>
          </div>
          {model.permissions.canViewAchievements ? (
            <ul className={styles.achievementList}>
              {model.achievements.map((achievement) => (
                <li data-rarity={achievement.rarity} key={achievement.id}>
                  <span aria-hidden="true">✦</span>
                  <div>
                    <strong>{achievement.title}</strong>
                    <p>{achievement.rarity}</p>
                  </div>
                  <b>{achievement.progressLabel}</b>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.redactedInline}>Achievements are private.</div>
          )}
        </section>
      </div>

      {model.redactedFields.length > 0 ? (
        <aside className={styles.redactionSummary}>
          <strong>Privacy protections active</strong>
          <p>Hidden for this viewer: {model.redactedFields.join(", ")}.</p>
        </aside>
      ) : null}
    </main>
  );
}
