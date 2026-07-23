import type { ActionCentreSnapshot } from "@/lib/actions";

import { actionCentreResponseSchema } from "../schema/action-centre.schema";

export class ActionCentreClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ActionCentreClientError";
  }
}

export async function getActionCentre(signal?: AbortSignal): Promise<ActionCentreSnapshot> {
  const response = await fetch("/api/actions", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { accept: "application/json" },
    signal,
  });

  const payload: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: { message?: unknown } }).error?.message ?? "Action centre unavailable.")
        : "Action centre unavailable.";
    throw new ActionCentreClientError(message, response.status, response.status >= 500);
  }

  const parsed = actionCentreResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ActionCentreClientError("Action centre returned invalid data.", 502, true);
  }

  return {
    items: parsed.data.data.items.map((action) => ({
      id: action.id,
      kind: action.kind,
      label: action.label,
      detail: action.detail,
      reason: action.reason,
      href: action.href,
      actionLabel: action.action_label,
      priority: action.priority,
      tone: action.tone,
      score: action.score,
      deadlineAt: action.deadline_at,
      sourceType: action.source_type,
      sourceId: action.source_id,
    })),
    generatedAt: parsed.data.meta.fetched_at,
    total: parsed.data.meta.total,
    criticalCount: parsed.data.meta.critical_count,
    highCount: parsed.data.meta.high_count,
  };
}
