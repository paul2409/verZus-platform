// VERZUS M9.5 CREW MEMBERSHIP SERVICE TESTS

import { beforeEach, describe, expect, it } from "vitest";

import { resetCrewMembershipStore } from "./crew-membership.store";
import {
  createCrewInvite,
  decideCrewApplication,
  leaveCrewMembership,
  submitCrewApplication,
} from "./crew-membership.service";

const now = new Date("2026-07-18T09:00:00.000Z");

beforeEach(() => resetCrewMembershipStore());

describe("Crew membership service", () => {
  it("submits an application once and replays the same idempotency key", () => {
    const first = submitCrewApplication(
      {
        crewId: "crew-apex-knights",
        expectedVersion: 1,
        game: "EA FC",
        message: "Available every weekend.",
        idempotencyKey: "application-key-0001",
      },
      now,
    );
    const replay = submitCrewApplication(
      {
        crewId: "crew-apex-knights",
        expectedVersion: 1,
        game: "EA FC",
        message: "Available every weekend.",
        idempotencyKey: "application-key-0001",
      },
      now,
    );

    expect(first.snapshot.applications).toHaveLength(1);
    expect(replay.replayed).toBe(true);
    expect(replay.eventId).toBe(first.eventId);
  });

  it("accepts an application and increments membership once", () => {
    const result = decideCrewApplication(
      {
        crewId: "crew-xenon-esports",
        applicationId: "request-1",
        expectedVersion: 1,
        decision: "accept",
        idempotencyKey: "decision-key-00001",
      },
      now,
    );

    expect(result.outcome).toBe("application_accepted");
    expect(result.snapshot.memberCount).toBe(26);
    expect(result.snapshot.applications[0]?.status).toBe("accepted");
  });

  it("deduplicates pending invites by player handle", () => {
    const first = createCrewInvite(
      {
        crewId: "crew-xenon-esports",
        expectedVersion: 1,
        playerHandle: "@orbit",
        role: "trial",
        idempotencyKey: "invite-key-0000001",
      },
      now,
    );
    const duplicate = createCrewInvite(
      {
        crewId: "crew-xenon-esports",
        expectedVersion: 2,
        playerHandle: "@orbit",
        role: "trial",
        idempotencyKey: "invite-key-0000002",
      },
      now,
    );

    expect(first.snapshot.invites).toHaveLength(1);
    expect(duplicate.outcome).toBe("invite_already_pending");
    expect(duplicate.snapshot.invites).toHaveLength(1);
  });

  it("blocks an owner from leaving before ownership transfer", () => {
    expect(() =>
      leaveCrewMembership(
        {
          crewId: "crew-xenon-esports",
          expectedVersion: 1,
          idempotencyKey: "leave-key-00000001",
        },
        now,
      ),
    ).toThrowError(expect.objectContaining({ code: "CREW_OWNER_TRANSFER_REQUIRED" }));
  });
});
