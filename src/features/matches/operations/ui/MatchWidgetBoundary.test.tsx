// VERZUS M7.7 MATCH WIDGET BOUNDARY TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MatchWidgetBoundary, MatchWidgetCrashProbe } from "./MatchWidgetBoundary";

describe("MatchWidgetBoundary", () => {
  it("isolates a widget crash and exposes a local retry", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <div>
        <MatchWidgetBoundary name="timeline">
          <MatchWidgetCrashProbe active name="timeline" />
        </MatchWidgetBoundary>
        <span>Support remains available</span>
      </div>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("timeline temporarily unavailable");
    expect(screen.getByText("Support remains available")).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry panel" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retry panel" }));
  });
});
