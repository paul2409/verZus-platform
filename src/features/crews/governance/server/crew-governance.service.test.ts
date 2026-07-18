// VERZUS M9.6 CREW GOVERNANCE SERVICE TESTS

import { beforeEach, describe, expect, it } from "vitest";

import {
  getCrewMembershipSnapshot,
  resetCrewMembershipStore,
} from "../../membership/server/crew-membership.store";
import {
  changeCrewMemberRole,
  CrewGovernanceServiceError,
  getCrewGovernanceForRead,
  removeCrewMember,
  transferCrewOwnership,
} from "./crew-governance.service";
import { resetCrewGovernanceStore } from "./crew-governance.store";

const crewId = "crew-xenon-esports";
const now = new Date("2026-07-18T08:00:00.000Z");

beforeEach(() => {
  resetCrewGovernanceStore();
  resetCrewMembershipStore();
});

describe("Crew governance invariants", () => {
  it("changes an allowed member role and records an audit event", () => {
    const snapshot = getCrewGovernanceForRead(crewId, now);
    const result = changeCrewMemberRole(
      {
        crewId,
        memberId: "player-venom",
        expectedVersion: snapshot.version,
        role: "manager",
        reason: "Promoted after verified leadership results.",
        idempotencyKey: "role-change-key-0001",
      },
      now,
    );

    expect(result.snapshot.members.find((member) => member.id === "player-venom")?.role).toBe(
      "manager",
    );
    expect(result.snapshot.auditEvents[0]?.action).toBe("member_role_changed");
  });

  it("replays the same idempotency key without duplicating the event", () => {
    const snapshot = getCrewGovernanceForRead(crewId, now);
    const input = {
      crewId,
      memberId: "player-kage",
      expectedVersion: snapshot.version,
      role: "member" as const,
      reason: "Trial completed with enough verified matches.",
      idempotencyKey: "role-replay-key-0001",
    };
    const first = changeCrewMemberRole(input, now);
    const replay = changeCrewMemberRole(input, now);

    expect(replay.replayed).toBe(true);
    expect(replay.eventId).toBe(first.eventId);
    expect(replay.snapshot.auditEvents).toHaveLength(1);
  });

  it("never allows the owner to be removed through member management", () => {
    const snapshot = getCrewGovernanceForRead(crewId, now);
    expect(() =>
      removeCrewMember(
        {
          crewId,
          memberId: snapshot.ownerId,
          expectedVersion: snapshot.version,
          reason: "Attempting an invalid owner removal.",
          idempotencyKey: "owner-remove-key-0001",
        },
        now,
      ),
    ).toThrowError(CrewGovernanceServiceError);
  });

  it("removes an eligible member, audits it and synchronizes member count", () => {
    const snapshot = getCrewGovernanceForRead(crewId, now);
    const result = removeCrewMember(
      {
        crewId,
        memberId: "player-kage",
        expectedVersion: snapshot.version,
        reason: "Repeated inactivity after documented warnings.",
        idempotencyKey: "member-remove-key-0001",
      },
      now,
    );

    expect(result.snapshot.members.some((member) => member.id === "player-kage")).toBe(false);
    expect(result.snapshot.auditEvents[0]?.action).toBe("member_removed");
    expect(getCrewMembershipSnapshot(crewId, now).memberCount).toBe(result.snapshot.members.length);
  });

  it("transfers ownership atomically and leaves exactly one owner", () => {
    const snapshot = getCrewGovernanceForRead(crewId, now);
    const result = transferCrewOwnership(
      {
        crewId,
        targetMemberId: "player-rivalking",
        expectedVersion: snapshot.version,
        reason: "Succession approved for the next competitive cycle.",
        idempotencyKey: "owner-transfer-key-0001",
      },
      now,
    );

    const owners = result.snapshot.members.filter((member) => member.role === "owner");
    expect(owners).toHaveLength(1);
    expect(owners[0]?.id).toBe("player-rivalking");
    expect(result.snapshot.members.find((member) => member.id === "player-prismo")?.role).toBe(
      "captain",
    );
    expect(getCrewMembershipSnapshot(crewId, now).viewer.role).toBe("captain");
  });

  it("rejects stale governance mutations", () => {
    try {
      changeCrewMemberRole(
        {
          crewId,
          memberId: "player-venom",
          expectedVersion: 99,
          role: "trial",
          reason: "Role review after a stale browser session.",
          idempotencyKey: "stale-role-key-0001",
        },
        now,
      );
      throw new Error("Expected a stale-version error.");
    } catch (error) {
      expect(error).toBeInstanceOf(CrewGovernanceServiceError);
      expect((error as CrewGovernanceServiceError).code).toBe("CREW_GOVERNANCE_STALE_VERSION");
    }
  });
});
