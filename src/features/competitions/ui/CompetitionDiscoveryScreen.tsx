"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/primitives/icon";
import { ClickableIntelEntity } from "@/components/primitives/intel-card";

import styles from "./CompetitionDiscoveryScreen.module.css";

const tabs = [
  { id: "matches", label: "MATCHES" },
  { id: "leaderboards", label: "LEADERBOARDS" },
  { id: "watch", label: "WATCH" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const qualifiers = [
  {
    id: "saturday-open",
    name: "SATURDAY OPEN QUALIFIER",
    meta: "EA FC · SAT 15:00 · 28/32",
    action: "JOIN" as const,
    tone: "join" as const,
  },
  {
    id: "cashbox-sprint",
    name: "CASHBOX SPRINT QUALIFIER",
    meta: "COD · SAT 18:00 · 16/32",
    action: "VIEW" as const,
    tone: "view" as const,
  },
  {
    id: "crew-lane",
    name: "CREW LANE PRELIM",
    meta: "CLASH · SUN 14:00 · 12/16",
    action: "PASS" as const,
    tone: "pass" as const,
  },
] as const;

const watchChannels = [
  { id: "main", title: "MAIN STAGE", meta: "LIVE · EA FC FINALS", tone: "live" as const },
  { id: "war", title: "CREW WAR FEED", meta: "UPCOMING · 19:00", tone: "soon" as const },
  { id: "ladder", title: "LADDER HIGHLIGHTS", meta: "REPLAY · TOP 8", tone: "replay" as const },
] as const;

const rankPreview = [
  { id: "player-kairo", name: "KAIRO", pts: "2,410", rank: 1 },
  { id: "player-jayflex", name: "JAYFLEX", pts: "2,310", rank: 4 },
  { id: "player-r3d", name: "R3DSTORM", pts: "2,180", rank: 5 },
] as const;

export function CompetitionDiscoveryScreen() {
  const [tab, setTab] = useState<TabId>("matches");

  return (
    <main className={styles.page} data-stage-4-screen="compete">
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>04.0 // COMPETE HUB</p>
        <h1>COMPETE</h1>
      </header>

      <nav aria-label="Compete sections" className={styles.hubTabs}>
        {tabs.map((item) => (
          <button
            aria-current={tab === item.id ? "page" : undefined}
            data-active={tab === item.id ? "true" : undefined}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "matches" ? (
        <section aria-labelledby="qualifiers-title" className={styles.section}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>06.3 // AVAILABLE</p>
            <h2 id="qualifiers-title">QUALIFIERS</h2>
          </header>
          <ul className={styles.qualifierList} data-vz-surface="panel">
            {qualifiers.map((item) => (
              <li className={styles.qualifierRow} data-vz-surface="row" key={item.id}>
                <div className={styles.qualifierCopy}>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
                <button className={styles.actionChip} data-tone={item.tone} type="button">
                  {item.action}
                </button>
              </li>
            ))}
          </ul>

          <article className={styles.queueCard} data-vz-surface="card">
            <span className={styles.queueAccent} />
            <div className={styles.queueTime}>
              <span>TIME</span>
              <strong>18:30</strong>
            </div>
            <div className={styles.queueMatch}>
              <span>MATCH</span>
              <strong>
                <ClickableIntelEntity entityId="player-jayflex" entityType="player" label="JAYFLEX">
                  JAYFLEX
                </ClickableIntelEntity>
                {" VS "}
                <ClickableIntelEntity entityId="player-r3d" entityType="player" label="R3DSTORM">
                  R3DSTORM
                </ClickableIntelEntity>
              </strong>
            </div>
            <div className={styles.queueAction}>
              <span>#31</span>
              <button className={styles.checkIn} data-vz-cta="primary" type="button">
                CHECK IN
                <Icon decorative name="chevron-right" size="sm" />
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {tab === "leaderboards" ? (
        <section aria-labelledby="ranks-title" className={styles.section}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>06.4 // SEASON ZERO</p>
            <h2 id="ranks-title">LEADERBOARDS</h2>
          </header>
          <ul className={styles.rankList}>
            {rankPreview.map((row) => (
              <li key={row.id}>
                <span>#{row.rank}</span>
                <ClickableIntelEntity entityId={row.id} entityType="player" label={row.name}>
                  {row.name}
                </ClickableIntelEntity>
                <strong>{row.pts}</strong>
              </li>
            ))}
          </ul>
          <Link className={styles.hubCta} href="/leaderboards">
            OPEN FULL RANKINGS
            <Icon decorative name="chevron-right" size="sm" />
          </Link>
        </section>
      ) : null}

      {tab === "watch" ? (
        <section aria-labelledby="watch-title" className={styles.section}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>05.0 // CHANNELS</p>
            <h2 id="watch-title">WATCH</h2>
          </header>
          <ul className={styles.watchList}>
            {watchChannels.map((channel) => (
              <li data-tone={channel.tone} key={channel.id}>
                <div>
                  <strong>{channel.title}</strong>
                  <span>{channel.meta}</span>
                </div>
                <Link href="/matches">WATCH</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
