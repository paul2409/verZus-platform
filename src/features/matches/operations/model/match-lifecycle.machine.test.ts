// VERZUS M7.2 MATCH LIFECYCLE STATE MACHINE TESTS

import { describe, expect, it } from "vitest";

import {
  assertMatchMutationPrecondition,
  canTransitionMatchState,
  getAllowedMatchTransitions,
} from "./match-lifecycle.machine";

describe("match lifecycle state machine", () => {
  it("allows only declared transitions", () => {
    expect(canTransitionMatchState("check-in-open", "checked-in")).toBe(true);
    expect(canTransitionMatchState("check-in-open", "completed")).toBe(false);
    expect(getAllowedMatchTransitions("completed")).toEqual([]);
  });

  it("advances state and version when expected state and version match", () => {
    expect(
      assertMatchMutationPrecondition(
        { state: "check-in-open", matchVersion: 12 },
        { expectedState: "check-in-open", expectedVersion: 12, nextState: "checked-in" },
      ),
    ).toEqual({ state: "checked-in", matchVersion: 13 });
  });

  it("blocks stale versions before evaluating transitions", () => {
    expect(() =>
      assertMatchMutationPrecondition(
        { state: "check-in-open", matchVersion: 13 },
        { expectedState: "check-in-open", expectedVersion: 12, nextState: "checked-in" },
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "MATCH_STALE_VERSION",
        retryable: true,
      }),
    );
  });

  it("blocks stale states and invalid transitions", () => {
    expect(() =>
      assertMatchMutationPrecondition(
        { state: "checked-in", matchVersion: 12 },
        { expectedState: "check-in-open", expectedVersion: 12, nextState: "checked-in" },
      ),
    ).toThrowError(expect.objectContaining({ code: "MATCH_STALE_STATE" }));

    expect(() =>
      assertMatchMutationPrecondition(
        { state: "check-in-open", matchVersion: 12 },
        { expectedState: "check-in-open", expectedVersion: 12, nextState: "completed" },
      ),
    ).toThrowError(expect.objectContaining({ code: "MATCH_INVALID_TRANSITION" }));
  });
});
