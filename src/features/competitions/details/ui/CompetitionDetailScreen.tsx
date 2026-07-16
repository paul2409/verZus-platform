"use client";

import { CompetitionLifecycleController } from "../../lifecycle/ui";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Icon } from "@/components/primitives/icon";
import { CompetitionEntryControl } from "../../entry";

import { useCompetitionDetailData } from "../hooks/useCompetitionDetailData";
import { competitionDetailScenarioSchema } from "../model/competition-detail.schema";
import type {
  CompetitionBracketViewModel,
  CompetitionDetailScenario,
  CompetitionEligibilityViewModel,
  CompetitionParticipantsViewModel,
  CompetitionRewardsViewModel,
  CompetitionRulesViewModel,
  CompetitionScheduleViewModel,
  CompetitionSummaryViewModel,
} from "../model/competition-detail.types";
import { CompetitionDetailStateCard } from "./CompetitionDetailResourceState";
import styles from "./CompetitionDetail.module.css";

const artByKey = {
  championship: "/competitions/verzus-championship-trophy.svg",
  "ea-fc": "/competitions/ea-fc-rookie-cup.svg",
  "cod-mobile": "/competitions/cod-mobile-squad-battles.svg",
  "clash-royale": "/competitions/clash-royale-ladder.svg",
  "league-of-legends": "/competitions/league-ranked-open.svg",
} as const;

function DetailHero({ summary }: { summary: CompetitionSummaryViewModel }) {
  return (
    <section className={styles.hero} aria-labelledby="competition-detail-title">
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>{summary.eyebrow}</span>
        <span className={styles.statusBadge}>{summary.statusLabel}</span>
        <h1 id="competition-detail-title">{summary.name}</h1>
        <p>{summary.description}</p>
        <div className={styles.heroMeta}>
          <span>{summary.seasonLabel}</span>
          <span>{summary.weekLabel}</span>
          <span>{summary.gameLabel}</span>
          <span>{summary.formatLabel}</span>
        </div>
        <div className={styles.heroTags}>
          {summary.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.heroArt}>
        <Image
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 48vw"
          src={artByKey[summary.artKey]}
        />
      </div>
      <aside className={styles.heroAction}>
        <span>PRIZE POOL</span>
        <strong>{summary.prizePoolLabel}</strong>
        <small>{summary.rewardNote}</small>
        <span>REGISTRATION CLOSES IN</span>
        <time dateTime="P2DT14H36M">{summary.countdownLabel}</time>
        <a href="#eligibility">REVIEW ENTRY REQUIREMENTS</a>
      </aside>
    </section>
  );
}

function SummaryPanel({ summary }: { summary: CompetitionSummaryViewModel }) {
  const stats = [
    ["GAME", summary.gameLabel],
    ["FORMAT", summary.formatLabel],
    ["REGION", summary.regionLabel],
    ["TEAM SIZE", summary.teamSizeLabel],
    ["CAPACITY", summary.capacityLabel],
    ["ENTRY FEE", summary.entryFeeLabel],
  ];
  return (
    <section className={styles.panel} aria-labelledby="summary-title">
      <header>
        <span>01</span>
        <h2 id="summary-title">COMPETITION SUMMARY</h2>
      </header>
      <div className={styles.statGrid}>
        {stats.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function EligibilityPanel({ eligibility }: { eligibility: CompetitionEligibilityViewModel }) {
  return (
    <section
      className={styles.panel}
      id="eligibility"
      aria-labelledby="eligibility-title"
      data-tone={eligibility.state}
    >
      <header>
        <span>02</span>
        <h2 id="eligibility-title">ELIGIBILITY</h2>
        <b>{eligibility.label}</b>
      </header>
      <p>{eligibility.summary}</p>
      <ul className={styles.checkList}>
        {eligibility.checks.map((check) => (
          <li key={check.id} data-met={check.met}>
            <Icon decorative name={check.met ? "check" : "x"} size="sm" />
            <span>
              <strong>{check.label}</strong>
              <small>{check.detail}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SchedulePanel({ schedule }: { schedule: CompetitionScheduleViewModel }) {
  return (
    <section className={styles.panel} aria-labelledby="schedule-title">
      <header>
        <span>03</span>
        <h2 id="schedule-title">SCHEDULE</h2>
        <small>{schedule.timezoneLabel}</small>
      </header>
      <ol className={styles.timeline}>
        {schedule.stages.map((stage) => (
          <li key={stage.id} data-status={stage.status}>
            <i />
            <div>
              <strong>{stage.label}</strong>
              <span>{stage.dateLabel}</span>
              <time>{stage.timeLabel}</time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RewardPanel({ rewards }: { rewards: CompetitionRewardsViewModel }) {
  return (
    <section className={styles.panel} aria-labelledby="reward-title">
      <header>
        <span>04</span>
        <h2 id="reward-title">REWARD POOL</h2>
      </header>
      <strong className={styles.prizeValue}>{rewards.prizePoolLabel}</strong>
      <p>{rewards.rewardNote}</p>
      <div className={styles.rewardGrid}>
        {rewards.breakdown.map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <strong>{item.valueLabel}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RulesPanel({ rules }: { rules: CompetitionRulesViewModel }) {
  return (
    <section className={styles.panel} id="rules" aria-labelledby="rules-title">
      <header>
        <span>05</span>
        <h2 id="rules-title">COMPETITION RULES</h2>
        <small>{rules.updatedLabel}</small>
      </header>
      <div className={styles.rulesGrid}>
        {rules.sections.map((section) => (
          <article key={section.id}>
            <h3>{section.title}</h3>
            <ol>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

function ParticipantsPanel({ participants }: { participants: CompetitionParticipantsViewModel }) {
  return (
    <section className={styles.panel} id="participants" aria-labelledby="participants-title">
      <header>
        <span>06</span>
        <h2 id="participants-title">PARTICIPANTS</h2>
        <small>{participants.totalLabel}</small>
      </header>
      <p className={styles.sectionNote}>{participants.confirmedLabel}</p>
      <div className={styles.participantList}>
        {participants.participants.map((participant) => (
          <article key={participant.id}>
            <span className={styles.seed}>#{participant.seed}</span>
            <span className={styles.avatar}>{participant.avatarInitials}</span>
            <div>
              <strong>{participant.name}</strong>
              <small>[{participant.tag}]</small>
            </div>
            <b>{participant.statusLabel}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function BracketPanel({ bracket }: { bracket: CompetitionBracketViewModel }) {
  return (
    <section className={styles.panel} id="bracket" aria-labelledby="bracket-title">
      <header>
        <span>07</span>
        <h2 id="bracket-title">BRACKET PREVIEW</h2>
        <small>{bracket.statusLabel}</small>
      </header>
      <div className={styles.bracket}>
        {bracket.rounds.map((round) => (
          <section key={round.id}>
            <h3>{round.label}</h3>
            {round.matches.map((match) => (
              <article key={match.id} data-state={match.state}>
                <span>{match.leftLabel}</span>
                <strong>{match.scoreLabel}</strong>
                <span>{match.rightLabel}</span>
              </article>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

export function CompetitionDetailScreen({ competitionId }: { competitionId: string }) {
  const searchParams = useSearchParams();
  const parsedScenario = competitionDetailScenarioSchema.safeParse(searchParams.get("scenario"));
  const scenario: CompetitionDetailScenario = parsedScenario.success
    ? parsedScenario.data
    : "normal";
  const resources = useCompetitionDetailData(competitionId, scenario);
  const summary = resources.summary.data?.value;

  if (!summary) {
    return (
      <main className={styles.page} data-m6-stage="6.7">
        {/* VERZUS M6.6 LIFECYCLE:START */}
        <CompetitionLifecycleController competitionId={competitionId} />
        {/* VERZUS M6.6 LIFECYCLE:END */}
        <Link className={styles.backLink} href="/compete">
          <Icon decorative name="chevron-right" size="xs" />
          BACK TO COMPETITIONS
        </Link>
        <CompetitionDetailStateCard
          state={resources.summary.state}
          requestId={resources.summary.requestId}
          onRetry={resources.retrySummary}
        />
      </main>
    );
  }

  return (
    <main className={styles.page} data-m6-stage="6.5">
      <div className={styles.topRow}>
        <Link className={styles.backLink} href="/compete">
          <Icon decorative name="chevron-right" size="xs" />
          BACK TO COMPETITIONS
        </Link>
        <nav aria-label="Competition detail sections">
          <a href="#summary-title">OVERVIEW</a>
          <a href="#rules">RULES</a>
          <a href="#participants">PARTICIPANTS</a>
          <a href="#bracket">BRACKET</a>
        </nav>
      </div>
      <DetailHero summary={summary} />
      <div className={styles.detailLayout}>
        <div className={styles.primaryColumn}>
          <SummaryPanel summary={summary} />
          {resources.schedule.data ? (
            <SchedulePanel schedule={resources.schedule.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.schedule.state}
              requestId={resources.schedule.requestId}
              onRetry={resources.retrySchedule}
            />
          )}
          {resources.rules.data ? (
            <RulesPanel rules={resources.rules.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.rules.state}
              requestId={resources.rules.requestId}
              onRetry={resources.retryRules}
            />
          )}
          {resources.participants.data ? (
            <ParticipantsPanel participants={resources.participants.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.participants.state}
              requestId={resources.participants.requestId}
              onRetry={resources.retryParticipants}
            />
          )}
          {resources.bracket.data ? (
            <BracketPanel bracket={resources.bracket.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.bracket.state}
              requestId={resources.bracket.requestId}
              onRetry={resources.retryBracket}
            />
          )}
        </div>
        <aside className={styles.sideColumn}>
          {resources.eligibility.data ? (
            <EligibilityPanel eligibility={resources.eligibility.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.eligibility.state}
              requestId={resources.eligibility.requestId}
              onRetry={resources.retryEligibility}
            />
          )}
          {resources.rewards.data ? (
            <RewardPanel rewards={resources.rewards.data.value} />
          ) : (
            <CompetitionDetailStateCard
              state={resources.rewards.state}
              requestId={resources.rewards.requestId}
              onRetry={resources.retryRewards}
            />
          )}
          <CompetitionEntryControl competitionId={competitionId} scenario={scenario} />
        </aside>
      </div>
    </main>
  );
}
