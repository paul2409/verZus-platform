// VERZUS M3 STEP 3.4

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RouteBoundariesPreviewPage from "./page";

describe("route boundaries preview", () => {
  it("renders the required route states", () => {
    render(<RouteBoundariesPreviewPage />);

    expect(screen.getByRole("heading", { name: "Route-Level Boundaries" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Loading Play" })).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Matches are temporarily unavailable",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Competition could not be located",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "This route needs a connection",
      }),
    ).toBeVisible();
    expect(screen.getByText(/being serviced/i)).toBeVisible();
    expect(screen.getByText(/sign in to continue/i)).toBeVisible();
    expect(screen.getByText(/cannot access this route/i)).toBeVisible();
  });
});
