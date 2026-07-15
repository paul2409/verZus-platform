// VERZUS M5 STEPS 5.1-5.4

import { describe, expect, it } from "vitest";

import {
  getPlayWidgetContract,
  playIndependentEndpoints,
  playPrimaryQuestions,
  playReferenceViewports,
  playScreenVariants,
  playWidgetContracts,
  validatePlayScreenContract,
} from "./play-screen.contract";

describe("Play screen contract", () => {
  it("defines every required Play reference state and viewport", () => {
    expect(playScreenVariants).toHaveLength(10);
    expect(playScreenVariants).toContain("partial_api_failure");
    expect(playScreenVariants).toContain("offline");
    expect(playReferenceViewports).toEqual([390, 768, 1440]);
  });

  it("answers the six primary player questions", () => {
    expect(playPrimaryQuestions).toHaveLength(6);
    expect(playPrimaryQuestions[0]).toBe("What do I need to do now?");
    expect(playPrimaryQuestions[5]).toBe("What opportunities can I enter?");
  });

  it("uses independent endpoints instead of one dashboard dependency", () => {
    expect(playIndependentEndpoints).toEqual([
      "/api/me/status",
      "/api/matches/next",
      "/api/check-ins/current",
      "/api/leaderboards/me",
      "/api/crews/me/summary",
      "/api/competitions/recommended",
      "/api/activity/recent",
    ]);
    expect(playIndependentEndpoints).not.toContain("/api/play-dashboard");
  });

  it("keeps essential actions independent", () => {
    expect(getPlayWidgetContract("check-in").essential).toBe(true);
    expect(getPlayWidgetContract("quick-actions").endpoint).toBeNull();
    expect(playWidgetContracts).toHaveLength(8);
  });

  it("has no internal contract violations", () => {
    expect(validatePlayScreenContract()).toEqual([]);
  });
});
