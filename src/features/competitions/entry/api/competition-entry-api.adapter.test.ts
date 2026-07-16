import { describe, expect, it } from "vitest";

import {
  adaptCompetitionEntryControl,
  adaptCompetitionEntryMutation,
} from "./competition-entry-api.adapter";

const meta = {
  server_now: "2026-07-16T12:00:00.000+01:00",
  last_updated_at: "2026-07-16T12:00:00.000+01:00",
  freshness: "fresh" as const,
};

const rawEntry = {
  entry_id: "entry-1",
  competition_id: "ea-fc-rookie-cup",
  competition_name: "EA FC ROOKIE CUP",
  state: "confirmed" as const,
  state_label: "CONFIRMED",
  entrant_label: "JAYFLEX",
  team_label: "SOLO ENTRY",
  registered_at: "2026-07-16T12:00:00.000+01:00",
  registered_at_label: "16 JUL 2026, 12:00",
  registration_code: "VZ-EFR-123456",
  entry_fee_label: "FREE",
  check_in_label: "CHECK-IN: JUL 19 · 17:30 WAT",
};

describe("competition entry adapters", () => {
  it("adapts the server-authoritative entry control", () => {
    const result = adaptCompetitionEntryControl({
      ok: true,
      data: {
        competition_id: "ea-fc-rookie-cup",
        competition_name: "EA FC ROOKIE CUP",
        lifecycle_state: "registration_open",
        lifecycle_label: "REGISTRATION OPEN",
        state_version: "ea-fc-rookie-cup:registration_open:v1",
        can_enter: true,
        eligibility_state: "eligible",
        eligibility_label: "ELIGIBLE",
        eligibility_summary: "Eligible to enter.",
        entrant_label: "JAYFLEX",
        team_label: "SOLO ENTRY",
        game_label: "EA FC",
        format_label: "SWISS FORMAT",
        entry_fee_label: "FREE",
        roster_lock_label: "ROSTER LOCKS WHEN CHECK-IN OPENS",
        check_in_label: "CHECK-IN: JUL 19 · 17:30 WAT",
        existing_entry: null,
      },
      request_id: "request-1",
      meta,
    });

    expect(result.value.canEnter).toBe(true);
    expect(result.value.stateVersion).toContain("registration_open");
  });

  it("adapts a confirmed duplicate response without duplicating the record", () => {
    const result = adaptCompetitionEntryMutation({
      ok: true,
      data: { entry: rawEntry, duplicate: true, already_entered: true },
      request_id: "request-2",
      meta,
    });

    expect(result.entry.registrationCode).toBe("VZ-EFR-123456");
    expect(result.duplicate).toBe(true);
    expect(result.alreadyEntered).toBe(true);
  });
});
