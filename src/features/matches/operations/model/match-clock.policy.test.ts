// VERZUS M7.2 SERVER CLOCK POLICY TESTS

import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot, formatMatchClockValue } from "./match-clock.policy";

describe("match clock policy", () => {
  const now = new Date("2026-07-16T20:00:00.000Z");

  it("anchors check-in deadlines to server time", () => {
    const clock = createMatchClockSnapshot("match-7", "check-in-open", now, 21);

    expect(clock.mode).toBe("countdown");
    expect(clock.activeDeadlineKind).toBe("check_in_closes");
    expect(Date.parse(clock.activeDeadlineAt ?? "") - Date.parse(clock.serverNow)).toBe(
      24 * 60_000 + 13_000,
    );
    expect(clock.matchVersion).toBe(21);
    expect(clock.timezone).toBe("UTC");
  });

  it("treats the in-progress clock as elapsed from the authoritative start", () => {
    const clock = createMatchClockSnapshot("match-7", "in-progress", now);

    expect(clock.mode).toBe("elapsed");
    expect(clock.activeDeadlineKind).toBe("match_starts");
    expect(Date.parse(clock.serverNow) - Date.parse(clock.matchStartsAt)).toBe(
      12 * 60_000 + 34_000,
    );
  });

  it("formats stable countdown values", () => {
    expect(formatMatchClockValue(24 * 60_000 + 13_000)).toBe("00H 24M 13S");
    expect(formatMatchClockValue(2 * 86_400_000 + 6 * 3_600_000 + 24 * 60_000, true)).toBe(
      "02D 06H 24M",
    );
  });
});
