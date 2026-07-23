import { describe, expect, it } from "vitest";

import type { ProactiveSignal } from "../model";
import { buildProactiveReminders } from "./proactive-operations.policy";

const now = new Date("2026-07-23T12:00:00.000Z");

function signal(overrides: Partial<ProactiveSignal>): ProactiveSignal {
  return {
    rule: "match_check_in",
    userId: "user-1",
    sourceId: "match-1",
    subject: "VERZUS Weekly Cup",
    detail: "Your scheduled match is waiting for check-in.",
    href: "/matches/match-1/check-in",
    actionLabel: "Check in",
    dueAt: new Date("2026-07-23T12:45:00.000Z"),
    expiresAt: new Date("2026-07-23T12:45:00.000Z"),
    ...overrides,
  };
}

describe("buildProactiveReminders", () => {
  it("escalates a check-in reminder when the server deadline is within one hour", () => {
    const [result] = buildProactiveReminders([signal({})], now);

    expect(result).toMatchObject({
      title: "MATCH CHECK-IN CLOSES SOON",
      priority: "critical",
      reference: "proactive:match_check_in:match-1",
    });
  });

  it("does not generate reminders outside a rule's approved time window", () => {
    const results = buildProactiveReminders(
      [
        signal({
          rule: "competition_registration_closing",
          sourceId: "competition-1",
          dueAt: new Date("2026-07-25T13:00:00.000Z"),
          expiresAt: new Date("2026-07-25T13:00:00.000Z"),
        }),
      ],
      now,
    );

    expect(results).toEqual([]);
  });

  it("deduplicates the same user and source while preserving independent users", () => {
    const results = buildProactiveReminders(
      [signal({}), signal({}), signal({ userId: "user-2" })],
      now,
    );

    expect(results).toHaveLength(2);
    expect(new Set(results.map((item) => `${item.userId}:${item.reference}`)).size).toBe(2);
  });
});
