// VERZUS M3 STEP 3.6

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

const profile = {
  name: "Jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online",
  points: 2840,
  crewName: "Mainland Titans",
} as const;

const status = {
  kind: "operational",
  label: "All systems operational",
  detail: "Live platform services available",
} as const;

describe("AppShell global overlays", () => {
  it("opens search and notification overlays from the top bar", () => {
    render(
      <AppShell currentPath="/play" notificationCount={3} profile={profile} status={status}>
        <p>Route content</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("dialog", { name: "Search VERZUS" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open notifications, 3 unread",
      }),
    );

    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeVisible();
  });

  it("starts non-blocking route progress for an internal destination", () => {
    render(
      <AppShell currentPath="/play" profile={profile} status={status}>
        <a href="/compete" onClick={(event) => event.preventDefault()}>
          Open Compete
        </a>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Open Compete" }));

    expect(screen.getByRole("progressbar")).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading route")).toBeVisible();
  });
});
