"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { PlayerIdentity } from "@/components/primitives/avatar";
import { Badge, StatValue } from "@/components/primitives/badge";
import { Button, type ButtonProps } from "@/components/primitives/button";

import type {
  CheckInState,
  MatchLifecycleStatus,
  MatchParticipantViewModel,
  MatchResultState,
  MatchViewModel,
  TimelineStepState,
} from "../model/match.types";
import styles from "./MatchPrimitives.module.css";

const matchStatusConfig = {
  scheduled: { label: "Scheduled", tone: "information" },
  "check-in-unavailable": { label: "Check-in unavailable", tone: "neutral" },
  "check-in-open": { label: "Check-in open", tone: "live" },
  "checked-in": { label: "Checked in", tone: "positive" },
  "opponent-not-checked-in": { label: "Opponent not checked in", tone: "warning" },
  "both-ready": { label: "Both ready", tone: "positive" },
  "lobby-open": { label: "Lobby open", tone: "live" },
  "in-progress": { label: "In progress", tone: "live" },
  "result-pending": { label: "Result pending", tone: "warning" },
  disputed: { label: "Disputed", tone: "negative" },
  forfeited: { label: "Forfeited", tone: "negative" },
  cancelled: { label: "Cancelled", tone: "negative" },
  completed: { label: "Completed", tone: "positive" },
} as const;

const checkInConfig = {
  unavailable: { label: "Unavailable", tone: "neutral" },
  available: { label: "Check in now", tone: "live" },
  "checking-in": { label: "Checking in", tone: "information" },
  "checked-in": { label: "Checked in", tone: "positive" },
  missed: { label: "Check-in missed", tone: "negative" },
} as const;

const resultConfig = {
  pending: { label: "Pending", tone: "warning" },
  won: { label: "Won", tone: "positive" },
  lost: { label: "Lost", tone: "negative" },
  draw: { label: "Draw", tone: "neutral" },
  disputed: { label: "Disputed", tone: "negative" },
  void: { label: "Void", tone: "neutral" },
} as const;

export function MatchStatus({ status }: { status: MatchLifecycleStatus }) {
  const config = matchStatusConfig[status];
  return (
    <Badge data-match-status={status} tone={config.tone} variant="outline">
      {config.label}
    </Badge>
  );
}

export function CheckInStatus({ state }: { state: CheckInState }) {
  const config = checkInConfig[state];
  return (
    <Badge data-check-in-state={state} tone={config.tone}>
      {config.label}
    </Badge>
  );
}

export type CheckInActionProps = Omit<
  ButtonProps,
  "children" | "loading" | "loadingLabel" | "variant"
> & {
  state: CheckInState;
};

export function CheckInAction({ state, disabled, ...buttonProps }: CheckInActionProps) {
  const isLoading = state === "checking-in";
  const isDisabled =
    disabled || state === "unavailable" || state === "checked-in" || state === "missed";

  return (
    <Button
      {...buttonProps}
      disabled={isDisabled}
      loading={isLoading}
      loadingLabel="Checking in"
      variant={state === "missed" ? "danger" : "primary"}
    >
      {checkInConfig[state].label}
    </Button>
  );
}

export type ParticipantIdentityProps = {
  participant: MatchParticipantViewModel;
  side: "home" | "away";
};

export function ParticipantIdentity({ participant, side }: ParticipantIdentityProps) {
  return (
    <div className={styles.participant} data-participant-side={side}>
      <PlayerIdentity
        avatarInitials={participant.initials}
        avatarTone={participant.tone}
        compact
        handle={participant.handle}
        name={participant.name}
        presence={participant.presence}
        verified={participant.verified}
      />
      <span className={styles.score}>{participant.score === null ? "–" : participant.score}</span>
    </div>
  );
}

export type ParticipantVersusProps = {
  home: MatchParticipantViewModel;
  away: MatchParticipantViewModel;
};

export function ParticipantVersus({ home, away }: ParticipantVersusProps) {
  return (
    <div className={styles.versus}>
      <ParticipantIdentity participant={home} side="home" />
      <span aria-label="versus" className={styles.versusMark}>
        VS
      </span>
      <ParticipantIdentity participant={away} side="away" />
    </div>
  );
}

export function MatchTimer({ value, label = "Starts in" }: { value: string; label?: string }) {
  return <StatValue label={label} size="lg" tone="information" value={value} />;
}

export function ResultStatus({ state }: { state: MatchResultState }) {
  const config = resultConfig[state];
  return (
    <Badge data-result-state={state} tone={config.tone} variant="solid">
      {config.label}
    </Badge>
  );
}

export type MatchIdentityProps = {
  match: MatchViewModel;
  actions?: ReactNode;
};

export function MatchIdentity({ match, actions }: MatchIdentityProps) {
  return (
    <section aria-label={`${match.home.name} versus ${match.away.name}`} className={styles.match}>
      <header className={styles.matchHeader}>
        <div>
          <p className={styles.kicker}>{match.competitionName}</p>
          <h3 className={styles.matchTitle}>{match.roundLabel}</h3>
        </div>
        <MatchStatus status={match.status} />
      </header>
      <ParticipantVersus away={match.away} home={match.home} />
      <footer className={styles.matchFooter}>
        <MatchTimer value={match.timerLabel} />
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </footer>
    </section>
  );
}

export type MatchTimelineStepProps = HTMLAttributes<HTMLLIElement> & {
  label: string;
  state: TimelineStepState;
  detail?: string;
};

export function MatchTimelineStep({
  label,
  state,
  detail,
  className,
  ...liProps
}: MatchTimelineStepProps) {
  return (
    <li
      {...liProps}
      className={`${styles.timelineStep} ${styles[`timeline${state[0]?.toUpperCase()}${state.slice(1)}`]!} ${className ?? ""}`.trim()}
      data-timeline-state={state}
    >
      <span aria-hidden="true" className={styles.timelineMarker} />
      <span className={styles.timelineContent}>
        <strong>{label}</strong>
        {detail ? <span>{detail}</span> : null}
      </span>
    </li>
  );
}

export type BracketNodeProps = {
  label: string;
  home: MatchParticipantViewModel;
  away: MatchParticipantViewModel;
  active?: boolean;
  winnerId?: string;
};

export function BracketNode({ label, home, away, active = false, winnerId }: BracketNodeProps) {
  return (
    <article
      aria-label={label}
      className={styles.bracketNode}
      data-bracket-active={active ? "true" : undefined}
    >
      <p className={styles.bracketLabel}>{label}</p>
      {[home, away].map((participant) => (
        <div
          className={styles.bracketParticipant}
          data-bracket-winner={winnerId === participant.id ? "true" : undefined}
          key={participant.id}
        >
          <span>{participant.name}</span>
          <strong>{participant.score === null ? "–" : participant.score}</strong>
        </div>
      ))}
    </article>
  );
}
