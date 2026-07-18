// VERZUS M10.6 AUDITABLE REWARD HISTORY EXPORTS

export * from "./adapter/reward-history-audit.adapter";
export * from "./api/reward-history-audit.client";
export * from "./api/reward-history-audit.query";
export * from "./model/reward-history-audit.types";
export * from "./schema/reward-history-audit.schema";
export * from "./ui";

export function parseRewardHistoryPage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 100);
}
