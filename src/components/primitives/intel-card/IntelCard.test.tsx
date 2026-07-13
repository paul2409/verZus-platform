import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  IntelCardAction,
  IntelCardActions,
  IntelCardShell,
  IntelMetric,
  IntelMetricGrid,
} from "./IntelCard";

describe("IntelCardShell", () => {
  it("renders domain-neutral intel content and actions", () => {
    render(
      <IntelCardShell
        ariaLabel="Test player intel"
        eyebrow="Player intel"
        statusLabel="Verified"
        variant="player"
      >
        <IntelMetricGrid>
          <IntelMetric label="Rank" value="#24" />
        </IntelMetricGrid>
        <IntelCardActions>
          <IntelCardAction href="/players/test" tone="primary">
            View player
          </IntelCardAction>
        </IntelCardActions>
      </IntelCardShell>,
    );

    expect(screen.getByRole("article", { name: "Test player intel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View player" })).toHaveAttribute(
      "href",
      "/players/test",
    );
  });

  it("contains loading without rendering feature content", () => {
    render(
      <IntelCardShell
        ariaLabel="Loading test intel"
        eyebrow="Match intel"
        state="loading"
        variant="match"
      >
        <span>Private content</span>
      </IntelCardShell>,
    );

    expect(screen.getByRole("status", { name: "Loading intel card" })).toBeVisible();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });

  it("isolates an error and preserves its fallback action", () => {
    render(
      <IntelCardShell
        ariaLabel="Failed intel"
        eyebrow="Crew intel"
        fallbackAction={<IntelCardAction href="/crews">Browse crews</IntelCardAction>}
        state="error"
        variant="crew"
      >
        <span>Unavailable content</span>
      </IntelCardShell>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Intel module failed");
    expect(screen.getByRole("link", { name: "Browse crews" })).toBeVisible();
    expect(screen.queryByText("Unavailable content")).not.toBeInTheDocument();
  });
});
