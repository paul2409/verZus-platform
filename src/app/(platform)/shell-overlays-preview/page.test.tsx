// VERZUS M3 STEP 3.6

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ShellOverlaysPreviewPage from "./page";

describe("shell overlays preview", () => {
  it("opens search and notifications independently", () => {
    render(<ShellOverlaysPreviewPage />);

    fireEvent.click(screen.getByRole("button", { name: "Open search" }));
    expect(screen.getByRole("dialog", { name: "Search VERZUS" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    fireEvent.click(screen.getByRole("button", { name: "Open notifications" }));
    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeVisible();
  });

  it("shows the non-blocking route loading state", () => {
    render(<ShellOverlaysPreviewPage />);

    fireEvent.click(screen.getByRole("button", { name: "Start route loading" }));

    expect(screen.getByText("Loading route")).toBeVisible();
    expect(screen.getByRole("button", { name: "Stop route loading" })).toBeVisible();
  });
});
