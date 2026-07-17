// VERZUS M7.7 TERMINAL OPERATIONS ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { adaptMatchTerminalRead } from "./match-terminal-api.adapter";

describe("match terminal adapter", () => {
  it("adapts a validated terminal snapshot", () => {
    const clock = createMatchClockSnapshot(
      "match-7",
      "forfeit",
      new Date("2026-07-17T00:00:00.000Z"),
      9,
    );
    const value = adaptMatchTerminalRead({
      ok: true,
      request_id: "req-1",
      data: {
        match_id: "match-7",
        seed_state: "in-progress",
        state: "forfeit",
        match_version: 9,
        terminal_reason: "Player forfeited after a connection failure.",
        terminal_at: "2026-07-17T00:00:00.000Z",
        actor_role: "current_user",
        audit_event_id: "audit-1",
        terminal_event_count: 1,
        last_updated_at: "2026-07-17T00:00:00.000Z",
        clock,
      },
    });

    expect(value.state).toBe("forfeit");
    expect(value.auditEventId).toBe("audit-1");
  });
});
