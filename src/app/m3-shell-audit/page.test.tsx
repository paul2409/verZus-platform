// VERZUS M3 STEP 3.7

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import M3ShellAuditPage from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("M3 shell audit preview", () => {
  it("keeps sibling widgets after a Crew widget crash", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(<M3ShellAuditPage />);

    fireEvent.click(screen.getByRole("button", { name: "Trigger Crew widget failure" }));

    expect(screen.getByText("Crew pulse is unavailable")).toBeVisible();
    expect(screen.getByText("Next Match")).toBeVisible();
    expect(screen.getByText("Current Position")).toBeVisible();
  });

  it("exposes offline and feature-disabled navigation states", () => {
    render(<M3ShellAuditPage />);

    fireEvent.click(screen.getByRole("button", { name: "Enable offline mode" }));
    fireEvent.click(screen.getByRole("button", { name: "Disable Crews feature" }));

    expect(screen.getAllByText("Offline mode").length).toBeGreaterThan(0);
    expect(
      document.querySelector('[data-navigation-id="crews"][aria-disabled="true"]'),
    ).not.toBeNull();
  });
});
