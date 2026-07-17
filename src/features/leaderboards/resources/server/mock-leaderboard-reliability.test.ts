// VERZUS M8.6 MOCK LEADERBOARD RELIABILITY TESTS

import { describe, expect, it } from "vitest";

import { adaptLeaderboardEntriesPayload } from "../api/leaderboard-api.adapter";
import { getMockLeaderboardResource } from "./mock-leaderboard.service";

const now = new Date("2026-07-17T10:00:00.000Z");

describe("mock leaderboard reliability scenarios", () => {
  it("returns structured offline and unauthorized failures", () => {
    const offline = getMockLeaderboardResource(
      "weekly",
      "entries",
      new URLSearchParams(),
      "offline",
      now,
    );
    const unauthorized = getMockLeaderboardResource(
      "weekly",
      "entries",
      new URLSearchParams(),
      "unauthorized",
      now,
    );

    expect(offline).toEqual(
      expect.objectContaining({
        status: 503,
        body: expect.objectContaining({
          error: expect.objectContaining({ code: "offline", retryable: true }),
        }),
      }),
    );
    expect(unauthorized).toEqual(
      expect.objectContaining({
        status: 401,
        body: expect.objectContaining({
          error: expect.objectContaining({
            code: "leaderboard_unauthorized",
            retryable: false,
          }),
        }),
      }),
    );
  });

  it("returns one malformed row inside an otherwise valid entries envelope", () => {
    const result = getMockLeaderboardResource(
      "weekly",
      "entries",
      new URLSearchParams(),
      "malformed-row",
      now,
    );
    const data = adaptLeaderboardEntriesPayload(result.body);

    expect(result.status).toBe(200);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.isolatedRowCount).toBe(1);
  });
});
