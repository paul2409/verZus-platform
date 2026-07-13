import { describe, expect, it } from "vitest";

import { getPlatformRouteById, resolvePlatformRoute } from "./platform-route";

describe("platform route metadata", () => {
  it("resolves exact and nested production routes", () => {
    expect(resolvePlatformRoute("/play?mode=ranked")?.id).toBe("play");
    expect(resolvePlatformRoute("/leaderboards/weekly/")?.id).toBe("leaderboards-weekly");
    expect(resolvePlatformRoute("/matches/m-1487")?.id).toBe("matches");
  });

  it("returns null for routes outside the production shell", () => {
    expect(resolvePlatformRoute("/design-system")).toBeNull();
  });

  it("exposes stable metadata by route ID", () => {
    expect(getPlatformRouteById("crews")).toMatchObject({
      href: "/crews",
      title: "Crews",
      section: "Social",
    });
  });
});
