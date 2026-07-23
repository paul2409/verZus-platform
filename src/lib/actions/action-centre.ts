export const actionCentreKinds = [
  "email_verification",
  "onboarding",
  "profile_readiness",
  "match_check_in",
  "match_lobby",
  "match_result_submit",
  "match_result_confirm",
  "match_dispute",
  "crew_invite",
  "reward_claim",
  "security_alert",
  "system_alert",
  "workflow_resume",
] as const;

export type ActionCentreKind = (typeof actionCentreKinds)[number];
export type ActionCentrePriority = "critical" | "high" | "normal";
export type ActionCentreTone = "danger" | "warning" | "success" | "info" | "violet";

export interface ActionCentreItem {
  id: string;
  kind: ActionCentreKind;
  label: string;
  detail: string;
  reason: string;
  href: string;
  actionLabel: string;
  priority: ActionCentrePriority;
  tone: ActionCentreTone;
  score: number;
  deadlineAt: string | null;
  sourceType: string;
  sourceId: string;
}

export interface ActionCentreSnapshot {
  items: ActionCentreItem[];
  generatedAt: string;
  total: number;
  criticalCount: number;
  highCount: number;
}
