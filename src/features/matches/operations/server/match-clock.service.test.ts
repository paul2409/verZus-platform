// VERZUS M7.2 MATCH CLOCK SERVER SERVICE TESTS

import { describe, expect, it } from "vitest";

import {
  createMatchClockEnvelope,
  getMockMatchClockSnapshot,
  resolveMockMatchOperationState,
} from "./match-clock.service";

describe("match clock server service", () => {
  it("allows deterministic state selection only for the approved reference match", () => {
    expect(resolveMockMatchOperationState("m7-preview", "both-ready")).toBe("both-ready");
    expect(resolveMockMatchOperationState("match-7", "completed")).toBe("scheduled");
  });

  it("returns one request-scoped authoritative snapshot", () => {
    const now = new Date("2026-07-16T20:00:00.000Z");
    const clock = getMockMatchClockSnapshot("m7-preview", "both-ready", now);
    const envelope = createMatchClockEnvelope(clock, "req-clock-1");

    expect(envelope.meta).toEqual({
      requestId: "req-clock-1",
      source: "mock-match-clock",
    });
    expect(envelope.data.matchId).toBe("m7-preview");
    expect(envelope.data.state).toBe("both-ready");
    expect(envelope.data.serverNow).toBe(now.toISOString());
  });
});
