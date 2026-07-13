import { describe, expect, it } from "vitest";

import {
  isShellNavigationCurrent,
  normalizeShellPath,
  resolveShellNavigationItem,
} from "./navigation-state";
import type { ShellNavigationItem } from "./shell.types";

const item: ShellNavigationItem = {
  id: "leaderboards",
  href: "/leaderboards/weekly",
  label: "Leaderboards",
  icon: "trophy",
  activePrefixes: ["/leaderboards"],
};

describe("navigation-state", () => {
  it("normalizes query strings, fragments and trailing slashes", () => {
    expect(normalizeShellPath("leaderboards/weekly/?tab=crew#top")).toBe("/leaderboards/weekly");
  });

  it("matches nested routes and configured active prefixes", () => {
    expect(isShellNavigationCurrent("/leaderboards/crew", item)).toBe(true);
    expect(isShellNavigationCurrent("/leaderboards/weekly/player-7", item)).toBe(true);
    expect(isShellNavigationCurrent("/matches/leaderboards", item)).toBe(false);
  });

  it("supports exact-only route matching", () => {
    const exactItem: ShellNavigationItem = { ...item, match: "exact" };

    expect(isShellNavigationCurrent("/leaderboards/weekly", exactItem)).toBe(true);
    expect(isShellNavigationCurrent("/leaderboards/weekly/player-7", exactItem)).toBe(false);
  });

  it("turns a disabled feature flag into a non-interactive state", () => {
    const resolved = resolveShellNavigationItem(
      { ...item, featureFlag: "leaderboards" },
      {
        currentPath: "/leaderboards/weekly",
        featureFlags: { leaderboards: false },
      },
    );

    expect(resolved.state).toBe("feature-flagged");
    expect(resolved.disabled).toBe(true);
    expect(resolved.reason).toBe("This feature is not enabled.");
  });

  it("disables network-required routes while preserving offline-safe routes", () => {
    const blocked = resolveShellNavigationItem(item, {
      currentPath: "/play",
      offline: true,
    });
    const safe = resolveShellNavigationItem(
      { ...item, offlineSafe: true },
      { currentPath: "/play", offline: true },
    );

    expect(blocked.state).toBe("disabled");
    expect(blocked.reason).toBe("Unavailable while offline.");
    expect(safe.state).toBe("available");
  });

  it("keeps partial and error destinations interactive", () => {
    const partial = resolveShellNavigationItem(item, {
      currentPath: "/play",
      runtimeStates: { leaderboards: "partial" },
    });
    const error = resolveShellNavigationItem(item, {
      currentPath: "/play",
      runtimeStates: { leaderboards: "error" },
    });

    expect(partial.disabled).toBe(false);
    expect(error.disabled).toBe(false);
  });
});
