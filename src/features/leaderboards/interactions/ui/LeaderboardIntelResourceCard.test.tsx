// VERZUS M8.9 API-BACKED INTEL CARD HOST TESTS

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LeaderboardIntelResourceCard } from "./LeaderboardIntelResourceCard";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={String(props.alt ?? "")} />
  ),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("LeaderboardIntelResourceCard", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders a schema-validated player card from the independent endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          data: {
            id: "player-prismo",
            display_name: "Prismo",
            handle: "@prismo",
            subtitle: "Verified competitive player",
            location_label: "Lagos, Nigeria",
            game_label: "EA FC",
            crew_name: "Xenon",
            avatar_src: "/intel-cards/jayflex.svg",
            rank: 1,
            trust: 97,
            verified: true,
            wins: 128,
            win_rate_label: "78%",
            points_label: "26,750",
            streak_label: "7W",
            recent_form: ["W", "W", "L"],
            recent_matches: [
              {
                id: "match-player-prismo-01",
                opponent_label: "Apex Predators",
                result: "W",
                score_label: "3-1",
                href: "/matches/match-player-prismo-01",
              },
            ],
            achievement_preview: ["Top 10 finish"],
            profile_href: "/players/player-prismo",
            challenge_href: null,
          },
          meta: {
            request_id: "req-player-card",
            fetched_at: "2026-07-17T12:00:00.000Z",
            freshness: "fresh",
            source: "mock-player-intel",
          },
        }),
        headers: new Headers(),
      }),
    );

    render(
      <LeaderboardIntelResourceCard selection={{ kind: "player", entityId: "player-prismo" }} />,
      { wrapper },
    );

    await waitFor(() =>
      expect(screen.getByRole("article", { name: "Player intel for Prismo" })).toBeVisible(),
    );
    expect(screen.getByText("Apex Predators")).toBeVisible();
    expect(screen.getByText(/req-player-card/i)).toBeVisible();
  });

  it("contains a Match endpoint failure and exposes retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          error: {
            code: "MATCH_INTEL_UNAVAILABLE",
            message: "Match intel is temporarily unavailable.",
            request_id: "req-match-error",
            retryable: false,
          },
        }),
        headers: new Headers(),
      }),
    );

    render(
      <LeaderboardIntelResourceCard
        selection={{ kind: "match", entityId: "match-player-prismo" }}
      />,
      { wrapper },
    );

    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
    expect(screen.getByRole("button", { name: "Retry intel" })).toBeVisible();
    expect(screen.getByText(/req-match-error/i)).toBeVisible();
  });
});
