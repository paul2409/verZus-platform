// VERZUS M3 STEP 3.5

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import WidgetBoundariesPreviewPage from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("widget boundary preview", () => {
  it("keeps sibling widgets visible after one widget crashes", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<WidgetBoundariesPreviewPage />);

    fireEvent.click(screen.getByRole("button", { name: "Trigger Crew failure" }));

    expect(screen.getByText("Crew pulse is unavailable")).toBeVisible();
    expect(screen.getByText("Next Match")).toBeVisible();
    expect(screen.getByText("Current Position")).toBeVisible();
    expect(screen.getByRole("button", { name: "Restore Crew widget" })).toBeVisible();
  });

  it("renders the controlled loading and unavailable states", () => {
    render(<WidgetBoundariesPreviewPage />);

    expect(screen.getByText("Loading Recommended competitions")).toBeVisible();
    expect(screen.getByText("Connection required")).toBeVisible();
    expect(screen.getByText("Some information is unavailable")).toBeVisible();
    expect(screen.getByText("Temporarily under maintenance")).toBeVisible();
    expect(screen.getByText("Nothing to show yet")).toBeVisible();
  });
});
