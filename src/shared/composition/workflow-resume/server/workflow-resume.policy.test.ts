import { describe, expect, it } from "vitest";

import {
  resolveWorkflowResumePolicy,
  WorkflowResumeValidationError,
} from "./workflow-resume.policy";

const crewPayload = {
  current_step: "identity",
  payload: {
    version: 1,
    submissionId: "submission-1234567890",
    name: "Night Shift Elite",
    tag: "NSE",
    description: "A disciplined competitive Crew.",
    primaryGame: "EA FC",
    region: "Nigeria",
    crestPreset: "neon-v",
    bannerPreset: "neon-grid",
    visibility: "public",
    recruiting: true,
    language: "English",
    minimumRank: "Open",
  },
} as const;

describe("workflow resume policy", () => {
  it("generates an internal Crew resume path", () => {
    const result = resolveWorkflowResumePolicy(
      "crew_creation",
      "current",
      crewPayload,
      new Date("2026-07-22T18:00:00.000Z"),
    );
    expect(result.resumePath).toBe("/crews/create?step=identity&resume=1");
    expect(result.summary).toContain("Night Shift Elite");
  });

  it("rejects unapproved payload fields", () => {
    expect(() =>
      resolveWorkflowResumePolicy("competition_entry", "competition-1", {
        current_step: "confirm",
        payload: { accepted: true, redirect: "https://example.com" },
      }),
    ).toThrow(WorkflowResumeValidationError);
  });

  it("creates a match result deep link without trusting a client path", () => {
    const result = resolveWorkflowResumePolicy("match_result", "match-1", {
      current_step: "score",
      payload: { homeScore: 2, awayScore: 1, note: "Confirmed with opponent." },
    });
    expect(result.resumePath).toBe("/matches/match-1#result-control");
    expect(result.summary).toContain("2-1");
  });
});
