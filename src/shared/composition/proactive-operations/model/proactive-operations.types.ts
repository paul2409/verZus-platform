export const proactiveRuleKeys = [
  "match_check_in",
  "match_lobby_ready",
  "match_result_confirmation",
  "competition_registration_closing",
  "crew_invite_expiring",
  "reward_claimable",
  "profile_readiness",
] as const;

export type ProactiveRuleKey = (typeof proactiveRuleKeys)[number];
export type ProactiveTriggerSource = "api" | "cli" | "scheduler";
export type ProactiveRunStatus = "completed" | "skipped" | "disabled";
export type ProactiveNotificationCategory = "match" | "competition" | "crew" | "reward" | "system";
export type ProactiveNotificationPriority = "critical" | "high" | "normal";

export type ProactiveSignal = {
  rule: ProactiveRuleKey;
  userId: string;
  sourceId: string;
  subject: string;
  detail: string;
  href: string;
  actionLabel: string;
  dueAt: Date | null;
  expiresAt: Date | null;
};

export type ProactiveReminder = {
  userId: string;
  rule: ProactiveRuleKey;
  sourceId: string;
  sourceType: `proactive_${ProactiveRuleKey}`;
  reference: string;
  title: string;
  description: string;
  category: ProactiveNotificationCategory;
  priority: ProactiveNotificationPriority;
  href: string;
  actionLabel: string;
  expiresAt: string | null;
};

export type ProactiveRunSummary = {
  runId: string;
  requestId: string;
  status: ProactiveRunStatus;
  trigger: ProactiveTriggerSource;
  candidateCount: number;
  reminderCount: number;
  createdCount: number;
  updatedCount: number;
  resolvedCount: number;
  startedAt: string;
  completedAt: string;
};
