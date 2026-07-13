import type { HTMLAttributes, ReactNode } from "react";

import { Badge, StatValue } from "@/components/primitives/badge";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardStats,
  CardStat,
  CardTitle,
} from "@/components/primitives/card";

import type {
  CompetitionLifecycleStatus,
  CompetitionViewModel,
  EligibilityState,
} from "../model/competition.types";
import styles from "./CompetitionPrimitives.module.css";

const statusConfig = {
  draft: { label: "Draft", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "information" },
  "registration-open": { label: "Registration open", tone: "positive" },
  "registration-closed": { label: "Registration closed", tone: "warning" },
  "check-in-open": { label: "Check-in open", tone: "live" },
  "in-progress": { label: "In progress", tone: "live" },
  completed: { label: "Completed", tone: "positive" },
  cancelled: { label: "Cancelled", tone: "negative" },
  archived: { label: "Archived", tone: "neutral" },
} as const;

const eligibilityConfig = {
  eligible: { label: "Eligible", tone: "positive" },
  ineligible: { label: "Not eligible", tone: "negative" },
  pending: { label: "Eligibility pending", tone: "warning" },
  closed: { label: "Entry closed", tone: "neutral" },
} as const;

export type CompetitionStatusProps = {
  status: CompetitionLifecycleStatus;
};

export function CompetitionStatus({ status }: CompetitionStatusProps) {
  const config = statusConfig[status];
  return (
    <Badge data-competition-status={status} tone={config.tone} variant="outline">
      {config.label}
    </Badge>
  );
}

export type EligibilityStatusProps = {
  state: EligibilityState;
  message?: string;
};

export function EligibilityStatus({ state, message }: EligibilityStatusProps) {
  const config = eligibilityConfig[state];
  return (
    <div className={styles.eligibility} data-eligibility-state={state}>
      <Badge tone={config.tone}>{config.label}</Badge>
      {message ? <span className={styles.eligibilityMessage}>{message}</span> : null}
    </div>
  );
}

export type CompetitionIdentityProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  game: string;
  format: string;
  visual?: ReactNode;
};

export function CompetitionIdentity({
  name,
  game,
  format,
  visual,
  className,
  ...divProps
}: CompetitionIdentityProps) {
  return (
    <div {...divProps} className={`${styles.identity} ${className ?? ""}`.trim()}>
      <div aria-hidden="true" className={styles.identityVisual}>
        {visual ?? "V"}
      </div>
      <div className={styles.identityText}>
        <strong className={styles.identityName}>{name}</strong>
        <span className={styles.identityMeta}>
          {game} · {format}
        </span>
      </div>
    </div>
  );
}

export type ScheduleValueProps = {
  value: string;
  timezone?: string;
  label?: string;
};

export function ScheduleValue({ value, timezone, label = "Starts" }: ScheduleValueProps) {
  return <StatValue detail={timezone} label={label} size="md" tone="information" value={value} />;
}

export type RewardValueProps = {
  value: string;
  label?: string;
};

export function RewardValue({ value, label = "Reward" }: RewardValueProps) {
  return <StatValue label={label} size="md" tone="warning" value={value} />;
}

export type CompetitionSummaryProps = {
  competition: CompetitionViewModel;
  actions?: ReactNode;
};

export function CompetitionSummary({ competition, actions }: CompetitionSummaryProps) {
  return (
    <Card
      aria-label={`${competition.name} competition`}
      density="regular"
      interactive
      rarity="rare"
      tone="primary"
    >
      <CardHeader>
        <div className={styles.headerLine}>
          <CompetitionIdentity
            format={competition.format}
            game={competition.game}
            name={competition.name}
          />
          <CompetitionStatus status={competition.status} />
        </div>
        <CardTitle as="h3">{competition.name}</CardTitle>
      </CardHeader>

      <CardBody>
        <EligibilityStatus
          message={competition.eligibilityMessage}
          state={competition.eligibility}
        />
        <div className={styles.valueGrid}>
          <ScheduleValue timezone={competition.timezoneLabel} value={competition.startsAtLabel} />
          <RewardValue value={competition.rewardLabel} />
        </div>
      </CardBody>

      <CardStats>
        <CardStat label="Players" value={competition.participantCount} />
        <CardStat label="Capacity" value={competition.capacity} />
        <CardStat label="Format" value={competition.format} />
      </CardStats>

      {actions ? <CardFooter>{actions}</CardFooter> : null}
    </Card>
  );
}
