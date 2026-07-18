"use client";

// VERZUS M9.1 CREW FOUNDATION SCREEN

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";

import {
  crewFoundationTabs,
  type CrewFoundationTab,
  type CrewFoundationViewModel,
} from "../model/crew-foundation.types";
import styles from "./CrewFoundationScreen.module.css";

const tabLabels: Record<CrewFoundationTab, string> = {
  overview: "Overview",
  roster: "Roster",
  requests: "Requests",
  activity: "Activity",
  rankings: "Rankings",
  achievements: "Achievements",
  settings: "Settings",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function roleLabel(role: CrewFoundationViewModel["members"][number]["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function CrewStatGrid({ model }: { model: CrewFoundationViewModel }) {
  const stats = [
    { label: "Rank", value: `#${model.stats.rank}`, extra: `▲ ${model.stats.movement}` },
    { label: "Points", value: formatNumber(model.stats.points), extra: null },
    { label: "Win rate", value: `${model.stats.winRate}%`, extra: null },
    { label: "Matches", value: `${model.stats.wins}W - ${model.stats.losses}L`, extra: null },
    { label: "Streak", value: `${model.stats.streak}W`, extra: null },
    { label: "Trust score", value: String(model.stats.trust), extra: "Excellent" },
  ] as const;

  return (
    <dl className={styles.statGrid}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt>{stat.label}</dt>
          <dd>
            {stat.value}
            {stat.extra ? <span>{stat.extra}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function OverviewPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <div className={styles.overviewGrid} data-crew-panel="overview">
      <article className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2>About us</h2>
          <Badge size="sm" tone="positive" variant="outline">
            Recruiting
          </Badge>
        </header>
        <p className={styles.description}>{model.identity.description}</p>
        <dl className={styles.detailGrid}>
          <div>
            <dt>Primary game</dt>
            <dd>{model.settings.primaryGame}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>West Africa</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{model.settings.language}</dd>
          </div>
          <div>
            <dt>Recruiting</dt>
            <dd>{model.settings.recruiting ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Minimum rank</dt>
            <dd>{model.settings.minimumRank}</dd>
          </div>
          <div>
            <dt>Community</dt>
            <dd>{model.settings.communityLinkLabel}</dd>
          </div>
        </dl>
      </article>

      <article className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2>Recent activity</h2>
          <Link href="/matches">View matches</Link>
        </header>
        <ol className={styles.activityList}>
          {model.activity.map((item) => (
            <li data-tone={item.tone} key={item.id}>
              <span className={styles.activityMark}>
                <Icon decorative name="swords" size="sm" />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.game} · {item.occurredAtLabel}
                </span>
              </div>
              {item.scoreLabel ? <b>{item.scoreLabel}</b> : null}
            </li>
          ))}
        </ol>
      </article>

      <article className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2>Top members</h2>
          <span>{model.stats.activeMembers} active</span>
        </header>
        <ol className={styles.memberList}>
          {model.members.map((member, index) => (
            <li key={member.id}>
              <span className={styles.memberRank}>{index + 1}</span>
              <span className={styles.avatar} data-status={member.status}>
                {member.initials}
              </span>
              <div>
                <strong>{member.name}</strong>
                <span>{roleLabel(member.role)}</span>
              </div>
              <b>{formatNumber(member.contribution)}</b>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}

function RosterPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="roster">
      <header className={styles.panelHeader}>
        <div>
          <h2>Crew roster</h2>
          <p>{model.identity.memberCount} registered members</p>
        </div>
        <Badge tone="information" variant="outline">
          Read-only foundation
        </Badge>
      </header>
      <div className={styles.rosterGrid}>
        {model.members.map((member) => (
          <article key={member.id}>
            <span className={styles.avatar} data-status={member.status}>
              {member.initials}
            </span>
            <div>
              <strong>{member.name}</strong>
              <span>{member.handle}</span>
            </div>
            <Badge
              size="sm"
              tone={member.role === "owner" ? "special" : "neutral"}
              variant="outline"
            >
              {roleLabel(member.role)}
            </Badge>
          </article>
        ))}
      </div>
    </article>
  );
}

function RequestsPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="requests">
      <header className={styles.panelHeader}>
        <div>
          <h2>Join requests</h2>
          <p>Review mutations arrive in M9.5.</p>
        </div>
        <Badge tone="warning" variant="solid">
          {model.requests.length} pending
        </Badge>
      </header>
      <ol className={styles.requestList}>
        {model.requests.map((request) => (
          <li key={request.id}>
            <span className={styles.avatar}>{request.playerName.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{request.playerName}</strong>
              <span>
                {request.handle} · {request.game}
              </span>
            </div>
            <span>Trust {request.trust}</span>
            <Badge
              size="sm"
              tone={request.status === "reviewing" ? "information" : "warning"}
              variant="outline"
            >
              {request.status}
            </Badge>
          </li>
        ))}
      </ol>
    </article>
  );
}

function ActivityPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="activity">
      <header className={styles.panelHeader}>
        <h2>Crew activity</h2>
        <span>Latest verified events</span>
      </header>
      <ol className={styles.activityList}>
        {model.activity.map((item) => (
          <li data-tone={item.tone} key={item.id}>
            <span className={styles.activityMark}>
              <Icon decorative name="clock" size="sm" />
            </span>
            <div>
              <strong>{item.title}</strong>
              <span>
                {item.game} · {item.occurredAtLabel}
              </span>
            </div>
            {item.scoreLabel ? <b>{item.scoreLabel}</b> : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

function RankingsPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="rankings">
      <header className={styles.panelHeader}>
        <h2>Crew Championship</h2>
        <Link href="/leaderboards/weekly?mode=crew">Open full leaderboard</Link>
      </header>
      <div className={styles.rankHero}>
        <span>Global rank</span>
        <strong>#{model.stats.rank}</strong>
        <b>▲ {model.stats.movement} this week</b>
      </div>
      <dl className={styles.rankingMetrics}>
        <div>
          <dt>Points</dt>
          <dd>{formatNumber(model.stats.points)}</dd>
        </div>
        <div>
          <dt>Record</dt>
          <dd>
            {model.stats.wins} - {model.stats.losses}
          </dd>
        </div>
        <div>
          <dt>Win rate</dt>
          <dd>{model.stats.winRate}%</dd>
        </div>
        <div>
          <dt>Trust</dt>
          <dd>{model.stats.trust}</dd>
        </div>
      </dl>
    </article>
  );
}

function AchievementsPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="achievements">
      <header className={styles.panelHeader}>
        <h2>Crew achievements</h2>
        <span>Season Zero</span>
      </header>
      <div className={styles.achievementGrid}>
        {model.achievements.map((achievement) => (
          <article data-unlocked={achievement.unlocked ? "true" : "false"} key={achievement.id}>
            <Icon decorative name={achievement.unlocked ? "trophy" : "lock"} size="lg" />
            <div>
              <strong>{achievement.name}</strong>
              <span>{achievement.description}</span>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

function SettingsPanel({ model }: { model: CrewFoundationViewModel }) {
  return (
    <article className={styles.panel} data-crew-panel="settings">
      <header className={styles.panelHeader}>
        <div>
          <h2>Crew settings</h2>
          <p>Read-only in M9.1. Permission-enforced mutations arrive later.</p>
        </div>
        <Badge tone="special" variant="outline">
          Owner view
        </Badge>
      </header>
      <dl className={styles.settingsList}>
        <div>
          <dt>Visibility</dt>
          <dd>{model.identity.visibility}</dd>
        </div>
        <div>
          <dt>Recruiting</dt>
          <dd>{model.settings.recruiting ? "Open" : "Closed"}</dd>
        </div>
        <div>
          <dt>Primary game</dt>
          <dd>{model.settings.primaryGame}</dd>
        </div>
        <div>
          <dt>Minimum rank</dt>
          <dd>{model.settings.minimumRank}</dd>
        </div>
        <div>
          <dt>Language</dt>
          <dd>{model.settings.language}</dd>
        </div>
      </dl>
      <div className={styles.readOnlyNotice}>
        <Icon decorative name="lock" size="sm" /> No mutation is enabled in this foundation stage.
      </div>
    </article>
  );
}

export type CrewFoundationScreenProps = {
  model: CrewFoundationViewModel;
  initialTab?: CrewFoundationTab;
  rosterPanel?: ReactNode;
  requestsPanel?: ReactNode;
  activityPanel?: ReactNode;
  settingsPanel?: ReactNode;
  managementEnabled?: boolean;
};

// VERZUS M9.5 MEMBERSHIP PANEL SLOTS
// VERZUS M9.6 GOVERNANCE PANEL SLOT
// VERZUS M9.7 ACTIVITY RELIABILITY PANEL SLOT

export function CrewFoundationScreen({
  model,
  initialTab = "overview",
  rosterPanel,
  requestsPanel,
  activityPanel,
  settingsPanel,
  managementEnabled = false,
}: CrewFoundationScreenProps) {
  const [activeTab, setActiveTab] = useState<CrewFoundationTab>(initialTab);
  const activePanel = useMemo(() => {
    switch (activeTab) {
      case "roster":
        return rosterPanel ?? <RosterPanel model={model} />;
      case "requests":
        return requestsPanel ?? <RequestsPanel model={model} />;
      case "activity":
        return activityPanel ?? <ActivityPanel model={model} />;
      case "rankings":
        return <RankingsPanel model={model} />;
      case "achievements":
        return <AchievementsPanel model={model} />;
      case "settings":
        return settingsPanel ?? <SettingsPanel model={model} />;
      case "overview":
        return <OverviewPanel model={model} />;
    }
  }, [activeTab, activityPanel, model, requestsPanel, rosterPanel, settingsPanel]);

  return (
    <main
      className={styles.page}
      data-crew-lifecycle={model.identity.lifecycle}
      data-m9-stage="9.7"
    >
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${model.identity.bannerSrc})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroIdentity}>
          <Image
            alt={`${model.identity.name} crest`}
            className={styles.crest}
            height={180}
            priority
            src={model.identity.crestSrc}
            width={154}
          />
          <div className={styles.heroCopy}>
            <div className={styles.heroBadges}>
              {model.identity.verified ? (
                <Badge tone="positive" variant="outline">
                  Verified
                </Badge>
              ) : null}
              <Badge tone="special" variant="outline">
                {model.identity.lifecycle}
              </Badge>
            </div>
            <div className={styles.titleRow}>
              <h1>{model.identity.name}</h1>
              <span>{model.identity.tag}</span>
            </div>
            <div className={styles.gameTags}>
              <Badge tone="information" variant="solid">
                {model.identity.tier}
              </Badge>
              {model.identity.games.map((game) => (
                <Badge key={game} size="sm" tone="neutral" variant="outline">
                  {game}
                </Badge>
              ))}
            </div>
            <p>{model.identity.tagline}</p>
          </div>
        </div>
        <div className={styles.heroActions}>
          <Button
            disabled={!managementEnabled}
            leadingIcon="settings"
            onClick={() => setActiveTab("roster")}
            title={
              managementEnabled
                ? "Open server-enforced member management"
                : "Crew management unavailable"
            }
            variant="primary"
          >
            Manage crew
          </Button>
          {/* VERZUS M9.2 DISCOVERY LINK */}
          <Link className={styles.secondaryAction} href="/crews?view=discover">
            <Icon decorative name="search" size="sm" /> Discover Crews
          </Link>
          <Link className={styles.secondaryAction} href="/leaderboards/weekly?mode=crew">
            <Icon decorative name="trophy" size="sm" /> Crew rankings
          </Link>
        </div>
      </section>

      <section className={styles.identitySummary} aria-label="Crew identity summary">
        <span>
          <Icon decorative name="users" size="sm" />
          <b>{model.identity.memberCount}</b> Members
        </span>
        <span>
          <Icon decorative name="target" size="sm" />
          {model.identity.region}
        </span>
        <span>
          <Icon decorative name="eye" size="sm" />
          {model.identity.visibility}
        </span>
        <span>
          <Icon decorative name="calendar" size="sm" />
          Founded {model.identity.foundedAtLabel}
        </span>
      </section>

      <CrewStatGrid model={model} />

      <nav aria-label="Crew sections" className={styles.tabs}>
        {crewFoundationTabs.map((tab) => (
          <button
            aria-current={activeTab === tab ? "page" : undefined}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tabLabels[tab]}
            {tab === "requests" ? <span>{model.requests.length}</span> : null}
          </button>
        ))}
      </nav>

      <section aria-live="polite" className={styles.tabPanel}>
        {activePanel}
      </section>

      <section className={styles.metricStrip} aria-label="Crew summary metrics">
        <div>
          <Icon decorative name="shield" size="md" />
          <span>Crew rating</span>
          <strong>2,310</strong>
        </div>
        <div>
          <Icon decorative name="trophy" size="md" />
          <span>Global rank</span>
          <strong>#{model.stats.rank}</strong>
        </div>
        <div>
          <Icon decorative name="check" size="md" />
          <span>Win rate</span>
          <strong>{model.stats.winRate}%</strong>
        </div>
        <div>
          <Icon decorative name="users" size="md" />
          <span>Active members</span>
          <strong>
            {model.stats.activeMembers} / {model.identity.memberCount}
          </strong>
        </div>
      </section>

      <footer className={styles.foundationNote}>
        <strong>M9.6 GOVERNANCE ACTIVE</strong>
        <span>
          Roles, permissions, member removal and ownership transfer are server-enforced and audited.
        </span>
      </footer>
    </main>
  );
}
