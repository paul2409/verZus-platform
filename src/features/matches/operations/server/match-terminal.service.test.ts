// VERZUS M7.7 TERMINAL OPERATIONS SERVICE TESTS

import { describe, expect, it } from "vitest";

import { executeMatchTerminalCommand } from "./match-terminal.service";
import { getTerminalMutationBlock } from "./match-terminal.store";

describe("match terminal service", () => {
  it("forfeits idempotently and blocks earlier lifecycle mutations", () => {
    const matchId = `terminal-forfeit-${crypto.randomUUID()}`;
    const command = {
      matchId,
      seedState: "in-progress" as const,
      expectedState: "in-progress" as const,
      expectedVersion: 12,
      idempotencyKey: "forfeit-idempotency-key-0001",
      action: "forfeit_match" as const,
      actorRole: "current_user" as const,
      reason: "Connection failure prevents the player from continuing.",
    };
    const first = executeMatchTerminalCommand(command, new Date("2026-07-17T00:00:00.000Z"));
    const replay = executeMatchTerminalCommand(command, new Date("2026-07-17T00:00:01.000Z"));

    expect(first.snapshot.state).toBe("forfeit");
    expect(first.snapshot.terminalEventCount).toBe(1);
    expect(replay.event.replayed).toBe(true);
    expect(getTerminalMutationBlock(matchId, "in-progress")?.code).toBe("MATCH_TERMINAL_STATE");
  });

  it("enforces role policy for cancellation", () => {
    const matchId = `terminal-cancel-${crypto.randomUUID()}`;
    expect(() =>
      executeMatchTerminalCommand({
        matchId,
        seedState: "scheduled",
        expectedState: "scheduled",
        expectedVersion: 12,
        idempotencyKey: "cancel-idempotency-key-0001",
        action: "cancel_match",
        actorRole: "current_user",
        reason: "Operations cancellation requested for this scheduled match.",
      }),
    ).toThrowError(expect.objectContaining({ code: "MATCH_TERMINAL_FORBIDDEN" }));
  });

  it("allows an admin to complete a confirmed result", () => {
    const matchId = `terminal-complete-${crypto.randomUUID()}`;
    const result = executeMatchTerminalCommand({
      matchId,
      seedState: "result-confirmed",
      expectedState: "result-confirmed",
      expectedVersion: 12,
      idempotencyKey: "complete-idempotency-key-0001",
      action: "complete_match",
      actorRole: "admin",
      reason: "Confirmed result passed final operations review.",
    });
    expect(result.snapshot.state).toBe("completed");
    expect(result.event.actorRole).toBe("admin");
  });
});
