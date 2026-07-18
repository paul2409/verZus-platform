// VERZUS M10.6 ABORTABLE AUDITABLE REWARD HISTORY CLIENT

import {
  adaptRewardHistoryAuditPayload,
  RewardHistoryAuditError,
} from "../adapter/reward-history-audit.adapter";
import type { RewardHistoryAuditSnapshot } from "../model/reward-history-audit.types";

export async function getRewardHistoryAudit(
  page: number,
  signal?: AbortSignal,
): Promise<RewardHistoryAuditSnapshot> {
  let response: Response;
  try {
    response = await fetch(`/api/rewards/history/audit?page=${page}&pageSize=4`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new RewardHistoryAuditError({
      code: "REWARD_HISTORY_AUDIT_OFFLINE",
      message: "Reward history is unavailable while offline.",
      requestId: "reward-history-audit-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RewardHistoryAuditError({
      code: "REWARD_HISTORY_AUDIT_INVALID_JSON",
      message: "Reward history returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "reward-history-audit-invalid-json",
      retryable: true,
    });
  }

  return adaptRewardHistoryAuditPayload(payload);
}
