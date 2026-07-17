// VERZUS M7.2 MATCH TIMELINE POLICY TESTS

import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot } from "./match-clock.policy";
import { buildMatchTimeline } from "./match-timeline";

describe("match timeline policy", () => {
  const now = new Date("2026-07-16T20:00:00.000Z");

  it("derives progress from the lifecycle state", () => {
    const clock = createMatchClockSnapshot("match-7", "lobby-open", now);
    const timeline = buildMatchTimeline("lobby-open", clock);

    expect(timeline.find((item) => item.id === "check-in-open")?.state).toBe("complete");
    expect(timeline.find((item) => item.id === "lobby-open")?.state).toBe("current");
    expect(timeline.find((item) => item.id === "in-progress")?.state).toBe("future");
  });

  it("marks audited terminal exceptions as warnings", () => {
    const clock = createMatchClockSnapshot("match-7", "disputed", now);
    const timeline = buildMatchTimeline("disputed", clock);

    expect(timeline.at(-1)).toEqual(expect.objectContaining({ id: "completed", state: "warning" }));
  });
});
