import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { competitionDiscoveryMock } from "../discovery/mocks/competition-discovery.mock";
import { competitionDiscoveryFilterOptionsFallback } from "../discovery/model/competition-discovery.constants";
import { paginateCompetitionDiscoveryItems } from "../discovery/model/competition-discovery.query";
import type { CompetitionDiscoveryFilters } from "../discovery/model/competition-discovery.types";
import { CompetitionDiscoveryScreen } from "./CompetitionDiscoveryScreen";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/compete",
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.params,
}));

vi.mock("../discovery/hooks/useCompetitionDiscoveryData", () => ({
  useCompetitionDiscoveryData: (filters: CompetitionDiscoveryFilters) => {
    const meta = {
      requestId: "test-request",
      serverNow: "2026-07-19T12:00:00.000Z",
      lastUpdatedAt: "2026-07-19T11:59:30.000Z",
      freshness: "fresh" as const,
    };
    const result = paginateCompetitionDiscoveryItems(
      competitionDiscoveryMock.competitions,
      filters,
    );
    return {
      featured: {
        state: "success",
        data: { competition: competitionDiscoveryMock.featured, meta },
        requestId: meta.requestId,
        errorCode: null,
        canRetry: true,
      },
      list: {
        state: result.items.length ? "success" : "empty",
        data: { ...result, meta },
        requestId: meta.requestId,
        errorCode: null,
        canRetry: true,
      },
      metadata: {
        state: "success",
        data: {
          journey: competitionDiscoveryMock.journey,
          guideLinks: competitionDiscoveryMock.guideLinks,
          filterOptions: competitionDiscoveryFilterOptionsFallback,
          meta,
        },
        requestId: meta.requestId,
        errorCode: null,
        canRetry: true,
      },
      entry: {
        state: "success",
        data: { entry: competitionDiscoveryMock.entry, meta },
        requestId: meta.requestId,
        errorCode: null,
        canRetry: true,
      },
      retryFeatured: vi.fn(),
      retryList: vi.fn(),
      retryMetadata: vi.fn(),
      retryEntry: vi.fn(),
    };
  },
}));

describe("CompetitionDiscoveryScreen", () => {
  beforeEach(() => {
    navigation.replace.mockReset();
    navigation.params = new URLSearchParams();
  });

  it("renders the M6.3 API-backed discovery composition", () => {
    render(<CompetitionDiscoveryScreen />);
    expect(screen.getByRole("heading", { name: "COMPETE" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "VERZUS CHAMPIONSHIP SERIES" })).toBeVisible();
    expect(screen.getByText("EA FC ROOKIE CUP")).toBeVisible();
  });

  it("filters and preserves URL state", async () => {
    const user = userEvent.setup();
    render(<CompetitionDiscoveryScreen />);
    await user.click(screen.getByRole("tab", { name: "ENTERED" }));
    expect(screen.getByText("LEAGUE OF LEGENDS RANKED OPEN")).toBeVisible();
    expect(navigation.replace).toHaveBeenCalledWith("/compete?tab=entered", { scroll: false });
  });

  it("debounces search without blanking current results", async () => {
    const user = userEvent.setup();
    render(<CompetitionDiscoveryScreen />);
    await user.type(screen.getByRole("searchbox", { name: "Search competitions" }), "Nexus");
    expect(screen.getByText("UPDATING…")).toBeVisible();
    await waitFor(() => expect(screen.getByText("LEAGUE NEXUS OPEN")).toBeVisible(), {
      timeout: 1000,
    });
  });
});
