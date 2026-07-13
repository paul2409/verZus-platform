// VERZUS M3 STEP 3.7

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
  detail: "Live services available",
} as const;

function Crash({ label }: { label: string }): never {
  throw Object.assign(new Error(`${label} failed`), {
    digest: `${label.toUpperCase().replaceAll(" ", "-")}-503`,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AppShell failure isolation", () => {
  it("keeps navigation and route content after sidebar and profile children fail", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AppShell
        currentPath="/play"
        profile={profile}
        profileControl={<Crash label="Profile control" />}
        sidebarSupplement={<Crash label="Sidebar intelligence" />}
        status={status}
      >
        <h1>Route content remains operational</h1>
      </AppShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Route content remains operational" }),
    ).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "Primary desktop navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sidebar intelligence is unavailable")).toBeVisible();
    expect(screen.getByRole("link", { name: "Open profile" })).toHaveAttribute("href", "/profile");
  });

  it("isolates notification content failure inside the drawer", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <AppShell
        currentPath="/play"
        notificationCount={3}
        notificationsContent={<Crash label="Notification content" />}
        profile={profile}
        status={status}
      >
        <p>Safe route content</p>
      </AppShell>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open notifications, 3 unread",
      }),
    );

    expect(screen.getByText("Notification content is unavailable")).toBeVisible();
    expect(screen.getByText("Safe route content")).toBeVisible();
  });
});
