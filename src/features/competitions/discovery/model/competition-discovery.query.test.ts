import { describe, expect, it } from "vitest";

import { competitionDiscoveryMock } from "../mocks/competition-discovery.mock";
import {
  defaultCompetitionDiscoveryFilters,
  filterCompetitionDiscoveryItems,
  paginateCompetitionDiscoveryItems,
  parseCompetitionDiscoverySearchParams,
  serializeCompetitionDiscoverySearchParams,
} from "./competition-discovery.query";

describe("competition discovery query state", () => {
  it("parses valid URL state and safely ignores invalid values", () => {
    const parsed = parseCompetitionDiscoverySearchParams(
      new URLSearchParams(
        "q=league&tab=entered&game=league-of-legends&team=5V5&fee=paid&sort=popular&page=2",
      ),
    );

    expect(parsed).toEqual({
      search: "league",
      tab: "entered",
      game: "league-of-legends",
      teamSize: "5V5",
      entryFee: "paid",
      sort: "popular",
      page: 2,
    });

    expect(
      parseCompetitionDiscoverySearchParams(
        new URLSearchParams("tab=broken&game=broken&team=broken&fee=broken&sort=broken&page=-4"),
      ),
    ).toEqual(defaultCompetitionDiscoveryFilters);
  });

  it("omits default values when serializing URL state", () => {
    expect(
      serializeCompetitionDiscoverySearchParams(defaultCompetitionDiscoveryFilters).toString(),
    ).toBe("");

    const params = serializeCompetitionDiscoverySearchParams({
      ...defaultCompetitionDiscoveryFilters,
      search: "EA FC",
      game: "ea-fc",
      page: 2,
    });

    expect(params.get("q")).toBe("EA FC");
    expect(params.get("game")).toBe("ea-fc");
    expect(params.get("page")).toBe("2");
  });

  it("searches all competition identity fields and sorts deterministically", () => {
    const results = filterCompetitionDiscoveryItems(competitionDiscoveryMock.competitions, {
      ...defaultCompetitionDiscoveryFilters,
      search: "double elimination",
      sort: "popular",
    });

    expect(results.map((competition) => competition.id)).toEqual([
      "cod-mobile-elite-series",
      "cod-mobile-squad-battles",
    ]);
  });

  it("paginates without returning an invalid empty page", () => {
    const result = paginateCompetitionDiscoveryItems(
      competitionDiscoveryMock.competitions,
      { ...defaultCompetitionDiscoveryFilters, page: 99 },
      4,
    );

    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(2);
    expect(result.items).toHaveLength(4);
  });
});
