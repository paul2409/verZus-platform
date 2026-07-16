"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";

import { IslandElitesIntelCard } from "./IslandElitesIntelCard";
import styles from "./CrewsScreen.module.css";

const gamePoints = [
  { label: "Total", value: "2,285", tone: "primary" },
  { label: "EA FC", value: "598", tone: "default" },
  { label: "COD", value: "610", tone: "default" },
  { label: "Clash", value: "520", tone: "default" },
  { label: "League", value: "565", tone: "default" },
] as const;

const crews = [
  {
    rank: 1,
    tag: "IE",
    name: "Island Elites",
    record: "W W W W W",
    points: "2,310",
    movement: "↑1",
    tone: "gold",
  },
  {
    rank: 2,
    tag: "MT",
    name: "Mainland Titans",
    record: "W W L W W",
    points: "2,285",
    movement: "↑1",
    tone: "green",
  },
  {
    rank: 3,
    tag: "LL",
    name: "Lagos Lynx",
    record: "W L W W L",
    points: "2,210",
    movement: "↓1",
    tone: "red",
  },
  {
    rank: 4,
    tag: "YV",
    name: "Yaba Voltage",
    record: "W W W L W",
    points: "2,144",
    movement: "↑2",
    tone: "cyan",
  },
] as const;

export function CrewsScreen() {
  const [intelOpen, setIntelOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!intelOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIntelOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [intelOpen]);

  return (
    <main className={styles.page} data-stage-4-screen="crews">
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <div aria-hidden="true" className={styles.crewMark}>
            MT
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>07.0 // CREW HQ</p>
            <h1>Mainland Titans</h1>
            <div className={styles.badges}>
              <Badge tone="positive" variant="outline">
                Founding crew
              </Badge>
              <Badge tone="warning" variant="outline">
                Rank #2
              </Badge>
            </div>
          </div>
        </div>
        <p className={styles.heroDescription}>
          Captain control room for licence tracking, lane coverage, roster operations and weekly
          Crew Verzus wars.
        </p>
        <div className={styles.heroActions}>
          <Button leadingIcon="shield" onClick={() => setIntelOpen(true)} variant="primary">
            Open crew intel
          </Button>
          <Button leadingIcon="users" variant="secondary">
            Manage roster
          </Button>
        </div>
      </header>

      <section aria-labelledby="standing-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>07.1 // SEASON ZERO</p>
            <h2 id="standing-title">Championship standing</h2>
          </div>
          <Badge tone="special" variant="outline">
            ● War week active
          </Badge>
        </div>

        <article className={styles.standingCard}>
          <div className={styles.standingTopline}>
            <div>
              <span>Current crew rank</span>
              <strong>#2</strong>
            </div>
            <div>
              <span>Movement</span>
              <strong className={styles.positive}>↑1</strong>
            </div>
            <div>
              <span>Form</span>
              <strong className={styles.form}>W W L W W</strong>
            </div>
          </div>

          <dl className={styles.pointGrid}>
            {gamePoints.map((item) => (
              <div data-tone={item.tone} key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.nextWar}>
            <div>
              <span>Next War Day</span>
              <strong>Saturday · 16:00 WAT</strong>
            </div>
            <div>
              <span>Opponent</span>
              <strong>VS Lagos Lynx</strong>
            </div>
          </div>
        </article>
      </section>

      <section aria-labelledby="crew-table-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>07.2 // CREW TABLE</p>
            <h2 id="crew-table-title">Season standings</h2>
          </div>
          <Button size="sm" variant="secondary">
            View full table
          </Button>
        </div>

        <ol className={styles.crewRows}>
          {crews.map((crew) => (
            <li data-tone={crew.tone} key={crew.name}>
              <span className={styles.crewRank}>#{crew.rank}</span>
              <span className={styles.crewTag}>{crew.tag}</span>
              <div className={styles.crewIdentity}>
                <strong>{crew.name}</strong>
                <span>{crew.record}</span>
              </div>
              <span className={styles.movement}>{crew.movement}</span>
              <strong className={styles.crewPoints}>{crew.points}</strong>
              {crew.name === "Island Elites" ? (
                <button
                  aria-label="Open Island Elites crew intel"
                  className={styles.intelButton}
                  onClick={() => setIntelOpen(true)}
                  type="button"
                >
                  <Icon decorative name="eye" size="sm" />
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {intelOpen ? (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIntelOpen(false);
            }
          }}
          role="presentation"
        >
          <section
            aria-labelledby="crew-intel-dialog-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
          >
            <header className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Crew Intel</p>
                <h2 id="crew-intel-dialog-title">Island Elites</h2>
              </div>
              <button
                aria-label="Close crew intel"
                className={styles.closeButton}
                onClick={() => setIntelOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                <Icon decorative name="x" size="md" />
              </button>
            </header>
            <div className={styles.modalBody}>
              <IslandElitesIntelCard />
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
