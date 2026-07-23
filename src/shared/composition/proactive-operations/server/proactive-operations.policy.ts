import type {
  ProactiveNotificationCategory,
  ProactiveNotificationPriority,
  ProactiveReminder,
  ProactiveRuleKey,
  ProactiveSignal,
} from "../model";

const HOUR_MS = 60 * 60 * 1_000;

function hoursUntil(date: Date | null, now: Date): number | null {
  if (!date) return null;
  return (date.getTime() - now.getTime()) / HOUR_MS;
}

function sourceType(rule: ProactiveRuleKey): `proactive_${ProactiveRuleKey}` {
  return `proactive_${rule}`;
}

function reminder(input: {
  signal: ProactiveSignal;
  title: string;
  description: string;
  category: ProactiveNotificationCategory;
  priority: ProactiveNotificationPriority;
}): ProactiveReminder {
  const { signal } = input;
  return {
    userId: signal.userId,
    rule: signal.rule,
    sourceId: signal.sourceId,
    sourceType: sourceType(signal.rule),
    reference: `proactive:${signal.rule}:${signal.sourceId}`,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    href: signal.href,
    actionLabel: signal.actionLabel,
    expiresAt: signal.expiresAt?.toISOString() ?? null,
  };
}

function evaluateSignal(signal: ProactiveSignal, now: Date): ProactiveReminder | null {
  const remainingHours = hoursUntil(signal.dueAt, now);

  switch (signal.rule) {
    case "match_check_in": {
      if (remainingHours === null || remainingHours <= 0 || remainingHours > 24) return null;
      const critical = remainingHours <= 1;
      return reminder({
        signal,
        title: critical ? "MATCH CHECK-IN CLOSES SOON" : "MATCH CHECK-IN IS OPEN",
        description: critical
          ? `${signal.subject} needs your check-in before the server deadline.`
          : signal.detail,
        category: "match",
        priority: critical ? "critical" : "high",
      });
    }

    case "match_lobby_ready":
      return reminder({
        signal,
        title: "YOUR MATCH LOBBY IS READY",
        description: signal.detail,
        category: "match",
        priority: "high",
      });

    case "match_result_confirmation": {
      if (remainingHours !== null && remainingHours <= 0) return null;
      const critical = remainingHours !== null && remainingHours <= 1;
      return reminder({
        signal,
        title: critical ? "RESULT CONFIRMATION DUE SOON" : "CONFIRM THE MATCH RESULT",
        description: signal.detail,
        category: "match",
        priority: critical ? "critical" : "high",
      });
    }

    case "competition_registration_closing": {
      if (remainingHours === null || remainingHours <= 0 || remainingHours > 24) return null;
      const critical = remainingHours <= 2;
      return reminder({
        signal,
        title: critical ? "REGISTRATION CLOSES SOON" : "FINISH YOUR COMPETITION ENTRY",
        description: signal.detail,
        category: "competition",
        priority: critical ? "critical" : "high",
      });
    }

    case "crew_invite_expiring": {
      if (remainingHours === null || remainingHours <= 0 || remainingHours > 48) return null;
      const critical = remainingHours <= 6;
      return reminder({
        signal,
        title: critical ? "CREW INVITE EXPIRES SOON" : "CREW INVITE NEEDS A DECISION",
        description: signal.detail,
        category: "crew",
        priority: critical ? "critical" : "high",
      });
    }

    case "reward_claimable": {
      if (remainingHours !== null && remainingHours <= 0) return null;
      if (remainingHours !== null && remainingHours > 72) return null;
      const critical = remainingHours !== null && remainingHours <= 6;
      const high = remainingHours !== null && remainingHours <= 24;
      return reminder({
        signal,
        title: critical
          ? "REWARD EXPIRES SOON"
          : high
            ? "CLAIM YOUR REWARD"
            : "REWARD READY TO CLAIM",
        description: signal.detail,
        category: "reward",
        priority: critical ? "critical" : high ? "high" : "normal",
      });
    }

    case "profile_readiness":
      return reminder({
        signal,
        title: "COMPLETE YOUR PLAYER PROFILE",
        description: signal.detail,
        category: "system",
        priority: "normal",
      });
  }
}

const priorityScore: Record<ProactiveNotificationPriority, number> = {
  critical: 3,
  high: 2,
  normal: 1,
};

export function buildProactiveReminders(
  signals: readonly ProactiveSignal[],
  now = new Date(),
): ProactiveReminder[] {
  const unique = new Map<string, ProactiveReminder>();

  for (const signal of signals) {
    const next = evaluateSignal(signal, now);
    if (!next) continue;
    unique.set(`${next.userId}:${next.reference}`, next);
  }

  return [...unique.values()].sort((left, right) => {
    const priority = priorityScore[right.priority] - priorityScore[left.priority];
    if (priority !== 0) return priority;

    const leftExpiry = left.expiresAt
      ? new Date(left.expiresAt).getTime()
      : Number.MAX_SAFE_INTEGER;
    const rightExpiry = right.expiresAt
      ? new Date(right.expiresAt).getTime()
      : Number.MAX_SAFE_INTEGER;
    return leftExpiry - rightExpiry;
  });
}
