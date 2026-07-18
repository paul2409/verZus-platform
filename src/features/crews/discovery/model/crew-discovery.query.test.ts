// VERZUS M9.2 CREW DISCOVERY QUERY TESTS

import { describe, expect, it } from "vitest";

import { crewDiscoveryMock } from "../mocks/crew-discovery.mock";
import {
  applyCrewDiscoveryQuery,
  buildCrewDiscoverySearchParams,
  parseCrewDiscoveryQuery,
} from "./crew-discovery.query";
import { defaultCrewDiscoveryQuery } from "./crew-discovery.types";

describe("crew discovery query policy", () => {
  it("normalizes invalid URL values", () => {
    expect(
      parseCrewDiscoveryQuery({
        game: "invalid",
        region: "invalid",
        recruiting: "invalid",
        sort: "invalid",
        page: "-4",
      }),
    ).toEqual(defaultCrewDiscoveryQuery);
  });

  it("filters and sorts deterministically", () => {
    const result = applyCrewDiscoveryQuery(crewDiscoveryMock, {
      ...defaultCrewDiscoveryQuery,
      game: "EA FC",
      recruiting: "all",
      sort: "rank",
    });

    expect(result.items.map((crew) => crew.id)).toEqual([
      "crew-prime-legion",
      "crew-xenon-esports",
      "crew-apex-knights",
      "crew-nova-union",
      "crew-eclipse-guild",
    ]);
  });

  it("serializes only meaningful URL state", () => {
    const params = buildCrewDiscoverySearchParams({
      ...defaultCrewDiscoveryQuery,
      q: "xenon",
      page: 2,
      joinCrewId: "crew-xenon-esports",
    });

    expect(params.toString()).toBe("view=discover&q=xenon&page=2&join=crew-xenon-esports");
  });
});
