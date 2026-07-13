// VERZUS M3 STEP 3.4

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RouteBoundariesPreviewPage from "./page";

describe("route boundaries preview", () => {
  it("renders the required route states", () => {
    render(<RouteBoundariesPreviewPage />);

    expect(screen.getByRole("heading", { name: "Route-Level Boundaries" })).toBeVisible();
    expect(screen.getByText("Loading Play")).toBeVisible();
    expect(screen.getByText(/temporarily unavailable/i)).toBeVisible();
    expect(screen.getByText(/could not be located/i)).toBeVisible();
    expect(screen.getByText(/needs a connection/i)).toBeVisible();
    expect(screen.getByText(/being serviced/i)).toBeVisible();
    expect(screen.getByText(/sign in to continue/i)).toBeVisible();
    expect(screen.getByText(/cannot access this route/i)).toBeVisible();
  });
});
