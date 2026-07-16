import type {
  CompetitionArtKey,
  CompetitionResourceMeta,
} from "../../discovery/model/competition-discovery.types";

export type CompetitionDetailScenario =
  | "normal"
  | "stale"
  | "partial_failure"
  | "offline"
  | "maintenance"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "malformed";

export type CompetitionDetailResourceState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "maintenance"
  | "partial_failure";

export type CompetitionDetailResource<TData> = {
  state: CompetitionDetailResourceState;
  data: TData | null;
  errorCode: string | null;
  requestId: string | null;
  canRetry: boolean;
};

export type CompetitionSummaryViewModel = {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  statusLabel: string;
  seasonLabel: string;
  weekLabel: string;
  gameLabel: string;
  formatLabel: string;
  regionLabel: string;
  teamSizeLabel: string;
  capacityLabel: string;
  entryFeeLabel: string;
  prizePoolLabel: string;
  rewardNote: string;
  countdownLabel: string;
  artKey: CompetitionArtKey;
  tags: string[];
};

export type EligibilityCheckViewModel = {
  id: string;
  label: string;
  detail: string;
  met: boolean;
};

export type CompetitionEligibilityViewModel = {
  state: "eligible" | "not_eligible" | "pending";
  label: string;
  summary: string;
  checks: EligibilityCheckViewModel[];
};

export type CompetitionScheduleStageViewModel = {
  id: string;
  label: string;
  dateLabel: string;
  timeLabel: string;
  status: "complete" | "current" | "upcoming";
};

export type CompetitionScheduleViewModel = {
  timezoneLabel: string;
  stages: CompetitionScheduleStageViewModel[];
};

export type CompetitionRewardBreakdownViewModel = {
  id: string;
  label: string;
  valueLabel: string;
};

export type CompetitionRewardsViewModel = {
  prizePoolLabel: string;
  rewardNote: string;
  breakdown: CompetitionRewardBreakdownViewModel[];
};

export type CompetitionRuleSectionViewModel = {
  id: string;
  title: string;
  items: string[];
};

export type CompetitionRulesViewModel = {
  updatedLabel: string;
  sections: CompetitionRuleSectionViewModel[];
};

export type CompetitionParticipantViewModel = {
  id: string;
  seed: number;
  name: string;
  tag: string;
  statusLabel: string;
  avatarInitials: string;
};

export type CompetitionParticipantsViewModel = {
  totalLabel: string;
  confirmedLabel: string;
  participants: CompetitionParticipantViewModel[];
};

export type CompetitionBracketMatchViewModel = {
  id: string;
  leftLabel: string;
  rightLabel: string;
  scoreLabel: string;
  state: "scheduled" | "live" | "complete";
};

export type CompetitionBracketRoundViewModel = {
  id: string;
  label: string;
  matches: CompetitionBracketMatchViewModel[];
};

export type CompetitionBracketViewModel = {
  statusLabel: string;
  rounds: CompetitionBracketRoundViewModel[];
};

export type CompetitionDetailResourceData<TData> = {
  value: TData;
  meta: CompetitionResourceMeta;
};

export type CompetitionDetailMock = {
  summary: CompetitionSummaryViewModel;
  eligibility: CompetitionEligibilityViewModel;
  schedule: CompetitionScheduleViewModel;
  rewards: CompetitionRewardsViewModel;
  rules: CompetitionRulesViewModel;
  participants: CompetitionParticipantsViewModel;
  bracket: CompetitionBracketViewModel;
};
