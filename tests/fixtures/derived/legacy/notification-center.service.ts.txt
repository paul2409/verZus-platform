// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.3 SERVER-AUTHORITATIVE NOTIFICATION FIXTURES

import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationRecord,
  NotificationScenario,
} from "../model/notification-center.types";

const now = new Date("2026-07-20T16:30:00.000Z");
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const records: NotificationRecord[] = [
  {
    id: "notification-check-in-open",
    title: "Check-in opens in 30 minutes",
    description: "Mainland Titans vs Island Elites. Confirm your EA FC lineup before the window closes.",
    category: "match",
    state: "unread",
    priority: "critical",
    createdAt: minutesAgo(2),
    expiresAt: new Date(now.getTime() + 28 * 60_000).toISOString(),
    href: "/matches/match-mainland-island/check-in",
    actionLabel: "Open check-in",
    sourceLabel: "Match operations",
    reference: "NTF-MAT-1042",
  },
  {
    id: "notification-crew-roster",
    title: "Crew War roster confirmed",
    description: "Xenon Esports locked your EA FC lane for Saturday War Day.",
    category: "crew",
    state: "unread",
    priority: "high",
    createdAt: minutesAgo(18),
    expiresAt: null,
    href: "/crews/crew-xenon-esports",
    actionLabel: "View roster",
    sourceLabel: "Crew operations",
    reference: "NTF-CRW-2091",
  },
  {
    id: "notification-reward-funded",
    title: "Weekly reward is ready",
    description: "Your 2,500 VS Credit reward is claimable from the Rewards centre.",
    category: "reward",
    state: "unread",
    priority: "normal",
    createdAt: minutesAgo(62),
    expiresAt: new Date(now.getTime() + 6 * 86_400_000).toISOString(),
    href: "/rewards",
    actionLabel: "Review reward",
    sourceLabel: "Rewards service",
    reference: "NTF-RWD-5118",
  },
  {
    id: "notification-rank-increase",
    title: "Weekly rank increased",
    description: "You moved from #27 to #23 on the Lagos EA FC weekly leaderboard.",
    category: "competition",
    state: "read",
    priority: "normal",
    createdAt: minutesAgo(245),
    expiresAt: null,
    href: "/leaderboards/weekly",
    actionLabel: "View standings",
    sourceLabel: "Leaderboard service",
    reference: "NTF-CMP-8804",
  },
  {
    id: "notification-new-device",
    title: "New device verified",
    description: "A Windows device in Lagos completed verification for your VERZUS account.",
    category: "security",
    state: "actioned",
    priority: "high",
    createdAt: daysAgo(1),
    expiresAt: null,
    href: "/profile/settings",
    actionLabel: "Review security",
    sourceLabel: "Identity security",
    reference: "NTF-SEC-7342",
  },
  {
    id: "notification-result-confirmed",
    title: "Match result confirmed",
    description: "Your 4–2 result against RivalKing was verified and added to your record.",
    category: "match",
    state: "read",
    priority: "normal",
    createdAt: daysAgo(1),
    expiresAt: null,
    href: "/profile/matches",
    actionLabel: "View match history",
    sourceLabel: "Match operations",
    reference: "NTF-MAT-1038",
  },
  {
    id: "notification-invite-dismissed",
    title: "Crew invite dismissed",
    description: "The invite from Apex Knights was removed from your active requests.",
    category: "crew",
    state: "dismissed",
    priority: "low",
    createdAt: daysAgo(2),
    expiresAt: null,
    href: "/crews?view=discover",
    actionLabel: "Discover Crews",
    sourceLabel: "Crew membership",
    reference: "NTF-CRW-2077",
  },
  {
    id: "notification-registration-closed",
    title: "Rookie Cup registration closed",
    description: "The registration window has ended. Your confirmed entry remains active.",
    category: "competition",
    state: "read",
    priority: "normal",
    createdAt: daysAgo(3),
    expiresAt: null,
    href: "/compete/competition-rookie-cup",
    actionLabel: "View competition",
    sourceLabel: "Competition service",
    reference: "NTF-CMP-8780",
  },
  {
    id: "notification-maintenance-complete",
    title: "Scheduled maintenance completed",
    description: "Matchmaking and leaderboard updates are operating normally again.",
    category: "system",
    state: "read",
    priority: "low",
    createdAt: daysAgo(4),
    expiresAt: null,
    href: "/play",
    actionLabel: "Return to Play",
    sourceLabel: "Platform operations",
    reference: "NTF-SYS-3401",
  },
  {
    id: "notification-reward-expired",
    title: "Reward claim window expired",
    description: "The Week 4 participation reward expired before it was claimed.",
    category: "reward",
    state: "expired",
    priority: "low",
    createdAt: daysAgo(6),
    expiresAt: daysAgo(1),
    href: "/rewards",
    actionLabel: "View reward history",
    sourceLabel: "Rewards service",
    reference: "NTF-RWD-5060",
  },
  {
    id: "notification-dispute-actioned",
    title: "Dispute resolution accepted",
    description: "Your evidence was reviewed and the final result is now recorded.",
    category: "match",
    state: "actioned",
    priority: "high",
    createdAt: daysAgo(8),
    expiresAt: null,
    href: "/profile/matches",
    actionLabel: "Review result",
    sourceLabel: "Dispute operations",
    reference: "NTF-MAT-0994",
  },
  {
    id: "notification-policy-update",
    title: "Competition policy updated",
    description: "Evidence requirements now include one clear final-score capture.",
    category: "system",
    state: "read",
    priority: "normal",
    createdAt: daysAgo(10),
    expiresAt: null,
    href: "/compete",
    actionLabel: "Review competitions",
    sourceLabel: "Platform policy",
    reference: "NTF-SYS-3374",
  },
];

export function normalizeNotificationScenario(value: string | null): NotificationScenario {
  const allowed: NotificationScenario[] = [
    "normal",
    "stale",
    "empty",
    "error",
    "offline",
    "slow",
    "malformed",
    "unauthorized",
    "maintenance",
    "forbidden",
    "not-found",
  ];
  return allowed.includes(value as NotificationScenario) ? (value as NotificationScenario) : "normal";
}

export function normalizeNotificationState(value: string | null): NotificationLifecycleState | "all" {
  const allowed: Array<NotificationLifecycleState | "all"> = [
    "all",
    "unread",
    "read",
    "actioned",
    "dismissed",
    "expired",
  ];
  return allowed.includes(value as NotificationLifecycleState | "all")
    ? (value as NotificationLifecycleState | "all")
    : "all";
}

export function normalizeNotificationCategory(value: string | null): NotificationCategory | "all" {
  const allowed: Array<NotificationCategory | "all"> = [
    "all",
    "match",
    "crew",
    "competition",
    "reward",
    "security",
    "system",
  ];
  return allowed.includes(value as NotificationCategory | "all")
    ? (value as NotificationCategory | "all")
    : "all";
}

// VERZUS M12.4 SHARED NOTIFICATION STATE

type NotificationMutationOperation = "read" | "actioned" | "dismissed";
type NotificationMutationInput =
  | {
      kind: "single";
      notificationId: string;
      operation: NotificationMutationOperation;
      expectedState: NotificationLifecycleState;
      idempotencyKey: string;
    }
  | {
      kind: "read-all";
      category: NotificationCategory | "all";
      idempotencyKey: string;
    };

type NotificationMutationResult = {
  item: NotificationRecord | null;
  operation: NotificationMutationOperation | "read_all";
  updatedCount: number;
  unreadCount: number;
  idempotencyKey: string;
  replayed: boolean;
};

type NotificationLedgerValue = {
  fingerprint: string;
  result: Omit<NotificationMutationResult, "replayed">;
};

type NotificationStateStore = {
  records: NotificationRecord[];
  idempotencyLedger: Map<string, NotificationLedgerValue>;
};

const notificationGlobal = globalThis as typeof globalThis & {
  __verzusM12NotificationStore?: NotificationStateStore;
};

function notificationStore(): NotificationStateStore {
  notificationGlobal.__verzusM12NotificationStore ??= {
    records: records.map((record) => ({ ...record })),
    idempotencyLedger: new Map(),
  };
  return notificationGlobal.__verzusM12NotificationStore;
}

export class NotificationMutationServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; status: number; retryable: boolean }) {
    super(input.message);
    this.name = "NotificationMutationServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
  }
}

export function getMutableNotificationRecords(): NotificationRecord[] {
  return notificationStore().records;
}

export function getNotificationUnreadCount(): number {
  return notificationStore().records.filter((record) => record.state === "unread").length;
}

function rememberMutation(
  key: string,
  fingerprint: string,
  result: Omit<NotificationMutationResult, "replayed">,
): NotificationMutationResult {
  const ledger = notificationStore().idempotencyLedger;
  ledger.set(key, { fingerprint, result });
  if (ledger.size > 250) {
    const oldest = ledger.keys().next().value;
    if (typeof oldest === "string") ledger.delete(oldest);
  }
  return { ...result, replayed: false };
}

export function applyNotificationMutation(
  input: NotificationMutationInput,
): NotificationMutationResult {
  const store = notificationStore();
  const fingerprint = JSON.stringify(input);
  const existing = store.idempotencyLedger.get(input.idempotencyKey);

  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      throw new NotificationMutationServiceError({
        code: "IDEMPOTENCY_KEY_REUSED",
        message: "This idempotency key was already used for a different notification update.",
        status: 409,
        retryable: false,
      });
    }
    return { ...existing.result, replayed: true };
  }

  if (input.kind === "read-all") {
    let updatedCount = 0;
    store.records = store.records.map((record) => {
      const categoryMatches = input.category === "all" || record.category === input.category;
      if (record.state !== "unread" || !categoryMatches) return record;
      updatedCount += 1;
      return { ...record, state: "read" };
    });

    return rememberMutation(input.idempotencyKey, fingerprint, {
      item: null,
      operation: "read_all",
      updatedCount,
      unreadCount: getNotificationUnreadCount(),
      idempotencyKey: input.idempotencyKey,
    });
  }

  const index = store.records.findIndex((record) => record.id === input.notificationId);
  if (index < 0) {
    throw new NotificationMutationServiceError({
      code: "NOTIFICATION_NOT_FOUND",
      message: "The requested notification no longer exists.",
      status: 404,
      retryable: false,
    });
  }

  const current = store.records[index];
  if (!current) {
    throw new NotificationMutationServiceError({
      code: "NOTIFICATION_NOT_FOUND",
      message: "The requested notification no longer exists.",
      status: 404,
      retryable: false,
    });
  }
  const targetState: NotificationLifecycleState =
    input.operation === "read" ? "read" : input.operation;

  if (current.state === targetState) {
    return rememberMutation(input.idempotencyKey, fingerprint, {
      item: current,
      operation: input.operation,
      updatedCount: 0,
      unreadCount: getNotificationUnreadCount(),
      idempotencyKey: input.idempotencyKey,
    });
  }

  if (current.state !== input.expectedState) {
    throw new NotificationMutationServiceError({
      code: "NOTIFICATION_STATE_CONFLICT",
      message: "The notification changed before this update was applied. Refresh and try again.",
      status: 409,
      retryable: true,
    });
  }

  if (["actioned", "dismissed", "expired"].includes(current.state)) {
    throw new NotificationMutationServiceError({
      code: "NOTIFICATION_STATE_TERMINAL",
      message: "This notification can no longer transition to the requested state.",
      status: 409,
      retryable: false,
    });
  }

  const updated: NotificationRecord = { ...current, state: targetState };
  store.records[index] = updated;

  return rememberMutation(input.idempotencyKey, fingerprint, {
    item: updated,
    operation: input.operation,
    updatedCount: 1,
    unreadCount: getNotificationUnreadCount(),
    idempotencyKey: input.idempotencyKey,
  });
}

export function queryNotifications(input: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  pageSize: number;
  scenario: NotificationScenario;
}) {
  const activeRecords = getMutableNotificationRecords();
  const filtered = input.scenario === "empty"
    ? []
    : activeRecords.filter((record) => {
        const stateMatches = input.state === "all" || record.state === input.state;
        const categoryMatches = input.category === "all" || record.category === input.category;
        return stateMatches && categoryMatches;
      });
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / input.pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(input.page, totalPages);
  const start = (safePage - 1) * input.pageSize;
  return {
    items: filtered.slice(start, start + input.pageSize),
    total: filtered.length,
    totalPages,
    page: safePage,
    unreadCount: getNotificationUnreadCount(),
  };
}

export function serializeNotification(record: NotificationRecord) {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    state: record.state,
    priority: record.priority,
    created_at: record.createdAt,
    expires_at: record.expiresAt,
    href: record.href,
    action_label: record.actionLabel,
    source_label: record.sourceLabel,
    reference: record.reference,
  };
}
