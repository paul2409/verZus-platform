// VERZUS M3 STEP 3.5

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WidgetLoadingFallback, WidgetUnavailableState } from "./WidgetFallbacks";

describe("widget fallback states", () => {
  it("announces loading without becoming an alert", () => {
    render(<WidgetLoadingFallback name="Weekly pool" />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading Weekly pool")).toBeVisible();
  });

  it("renders an independent partial-data state", () => {
    render(<WidgetUnavailableState name="Player rank" variant="partial" />);

    expect(screen.getByRole("region", { name: /some information is unavailable/i })).toBeVisible();
  });

  it("retries only the unavailable widget", () => {
    const retry = vi.fn();

    render(<WidgetUnavailableState name="Opportunities" variant="offline" onRetry={retry} />);

    fireEvent.click(screen.getByRole("button", { name: "Retry Opportunities" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
