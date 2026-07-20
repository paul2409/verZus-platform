// VERZUS M11.1 APPROVED MOBILE PLAYER PROFILE FOUNDATION

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/primitives/badge";

import { ownPlayerProfileMock } from "../mocks/player-profile.mock";
import type {
  PlayerAchievementPreview,
  PlayerGameIdentity,
  PlayerProfileViewModel,
  PlayerRecentMatch,
} from "../model/player-profile.types";
import styles from "./PlayerProfileFoundationScreen.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");

function AvatarIdentity({ model }: { model: PlayerProfileViewModel }) {
  const initials = model.identity.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <section aria-labelledby="profile-name" className={styles.identityCard}>
      <div
        className={styles.banner}
        style={{ backgroundImage: `url(${model.identity.bannerSrc})` }}
      />

      <div className={styles.identityBody}>
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
              {initials || "P"}
            </span>
          )}
          {model.identity.verified ? (
            <span aria-label="Verified player" className={styles.verifiedMark}>
              ✓
            </span>
          ) : null}
        </div>

        <div className={styles.identityHeading}>
          <div className={styles.nameRow}>
            <h1 id="profile-name">{model.identity.displayName}</h1>
            <Badge tone="special" variant="outline">
              LV 24
            </Badge>
          </div>
          <p className={styles.handle}>{model.identity.handle}</p>
          <p className={styles.playerTitle}>{model.identity.title}</p>
        </div>

        <div className={styles.identityBadges}>
          <Badge tone="positive">Verified</Badge>
          <Badge tone="information" variant="outline">
            {model.identity.locationLabel}
          </Badge>
          <Badge tone="special" variant="soft">
            #{model.stats.weeklyRank} weekly
          </Badge>
        </div>

        <p className={styles.bio}>{model.identity.bio}</p>

        <dl className={styles.identityMeta}>
          <div>
            <dt>Visibility</dt>
            <dd>{model.identity.profileVisibility}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{model.identity.joinedLabel.replace("Joined ", "")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function ProfileStatGrid({ model }: { model: PlayerProfileViewModel }) {
  const items = [
    ["Matches", numberFormatter.format(model.stats.matches)],
    ["Win rate", model.stats.winRateLabel],
    ["Rating", numberFormatter.format(model.stats.rating)],
    ["Trust", `${model.stats.trustScore}`],
  ] as const;

  return (
    <section aria-labelledby="profile-stats-title" className={styles.statPanel} id="statistics">
      <div className={styles.sectionHeading}>
        <div>
          <p>Confirmed performance</p>
          <h2 id="profile-stats-title">Player statistics</h2>
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
        <span>{numberFormatter.format(model.stats.points)} points</span>
      </div>
    </section>
  );
}

function GameIdentityRow({ identity }: { identity: PlayerGameIdentity }) {
  return (
    <li className={styles.gameRow}>
      <div className={styles.gameGlyph} aria-hidden="true">
        {identity.gameLabel.slice(0, 2).toUpperCase()}
      </div>
      <div className={styles.gamePrimary}>
        <strong>{identity.gameLabel}</strong>
        <span>
          {identity.handle} · {identity.platformLabel}
        </span>
      </div>
      <div className={styles.gameMeta}>
        <strong>{identity.rankLabel}</strong>
        <span>
          {identity.recordLabel}
          {identity.verified ? " · Verified" : " · Pending"}
        </span>
      </div>
    </li>
  );
}

function RecentMatchRow({ match }: { match: PlayerRecentMatch }) {
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

function AchievementRow({ achievement }: { achievement: PlayerAchievementPreview }) {
  return (
    <li className={styles.achievementRow} data-rarity={achievement.rarity}>
      <span aria-hidden="true" className={styles.achievementGlyph}>
        ✦
      </span>
      <div>
        <strong>{achievement.title}</strong>
        <span>{achievement.rarity}</span>
      </div>
      <p>{achievement.progressLabel}</p>
    </li>
  );
}

export function PlayerProfileFoundationScreen({
  model = ownPlayerProfileMock,
}: {
  model?: PlayerProfileViewModel;
} = {}) {
  return (
    <main
      className={styles.page}
      data-m11-stage="11.1"
      data-profile-scope="own"
      data-reference-viewport="390"
    >
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Season Zero · Own profile</p>
          <h2>Player profile</h2>
        </div>
        <Badge tone="positive" variant="outline">
          Active
        </Badge>
      </header>

      <AvatarIdentity model={model} />

      <nav aria-label="Profile sections" className={styles.sectionNav}>
        <a href="#overview">Overview</a>
        <a href="#recent-matches">Matches</a>
        <a href="#statistics">Stats</a>
        <a href="#achievements">Achievements</a>
      </nav>

      <ProfileStatGrid model={model} />

      <div className={styles.contentGrid} id="overview">
        <section aria-labelledby="availability-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Readiness</p>
              <h2 id="availability-title">Availability</h2>
            </div>
            <Badge tone="positive">{model.availability.state}</Badge>
          </div>
          <div className={styles.availabilityCard}>
            <strong>{model.availability.label}</strong>
            <p>{model.availability.detail}</p>
            <span>{model.availability.nextWindowLabel}</span>
          </div>
        </section>

        <section aria-labelledby="crew-title" className={styles.panel}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Team identity</p>
              <h2 id="crew-title">Crew</h2>
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
            <div className={styles.emptyInline}>No Crew membership.</div>
          )}
        </section>

        <section aria-labelledby="games-title" className={`${styles.panel} ${styles.widePanel}`}>
          <div className={styles.sectionHeading}>
            <div>
              <p>Connected platforms</p>
              <h2 id="games-title">Game identities</h2>
            </div>
            <span>{model.games.length} linked</span>
          </div>
          <ul className={styles.gameList}>
            {model.games.map((identity) => (
              <GameIdentityRow identity={identity} key={identity.id} />
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="recent-title"
          className={`${styles.panel} ${styles.widePanel}`}
          id="recent-matches"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p>Verified results</p>
              <h2 id="recent-title">Recent matches</h2>
            </div>
            <span>{model.recentMatches.length} shown</span>
          </div>
          <ul className={styles.matchList}>
            {model.recentMatches.map((match) => (
              <RecentMatchRow key={match.id} match={match} />
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="achievements-title"
          className={`${styles.panel} ${styles.widePanel}`}
          id="achievements"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p>Progress highlights</p>
              <h2 id="achievements-title">Achievements</h2>
            </div>
            <span>{model.achievements.filter((item) => item.unlocked).length} unlocked</span>
          </div>
          <ul className={styles.achievementList}>
            {model.achievements.map((achievement) => (
              <AchievementRow achievement={achievement} key={achievement.id} />
            ))}
          </ul>
        </section>
      </div>

      <aside className={styles.stageNotice}>
        <strong>Own-profile foundation</strong>
        <p>
          Editing, public-player permissions, full history, trust history and privacy controls
          arrive in later M11 stages.
        </p>
      </aside>
    </main>
  );
}
