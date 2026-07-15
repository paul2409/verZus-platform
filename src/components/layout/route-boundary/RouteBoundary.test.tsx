// VERZUS M3 STEP 3.4

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RouteError } from "./RouteError";
import { RouteLoading } from "./RouteLoading";
import { RouteNotFound } from "./RouteNotFound";

describe("route-level boundary states", () => {
  it("announces route loading without removing shell-safe copy", () => {
    render(<RouteLoading routeName="Play" />);

    expect(
      screen.getByRole("region", {
        name: "Loading Play",
      }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("heading", { name: "Loading Play" })).toBeVisible();
    expect(screen.getByText(/navigation and other shell controls remain available/i)).toBeVisible();
  });

  it("retries only the failed route", () => {
    const reset = vi.fn();

    render(
      <RouteError
        error={Object.assign(new Error("Route exploded"), {
          digest: "ERR-PLAY-001",
        })}
        reset={reset}
        routeName="Play"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry route" }));

    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/ERR-PLAY-001/)).toBeVisible();
  });

  it("provides safe destinations from a not-found state", () => {
    render(<RouteNotFound routeName="Match" />);

    expect(screen.getByRole("link", { name: "Go to Play" })).toHaveAttribute("href", "/play");
    expect(screen.getByRole("link", { name: "Search VERZUS" })).toHaveAttribute("href", "/search");
  });
});
