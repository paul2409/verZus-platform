import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

const profile = {
  name: "Jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online" as const,
  points: 2310,
  crewName: "Mainland Titans",
};

const status = {
  kind: "operational" as const,
  label: "Online",
  detail: "All systems operational",
};

describe("AppShell", () => {
  it("keeps the current route identifiable across shell navigation", () => {
    render(
      <AppShell currentPath="/play" profile={profile} status={status}>
        <h1>Command centre</h1>
      </AppShell>,
    );

    expect(screen.getByRole("heading", { name: "Command centre" })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: /Play/i })
        .some((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  it("opens the navigation drawer without replacing page content", async () => {
    const user = userEvent.setup();
    render(
      <AppShell currentPath="/play" profile={profile} status={status}>
        <h1>Command centre</h1>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Command centre" })).toBeInTheDocument();
  });

  it("opens the notification drawer with supplied content", async () => {
    const user = userEvent.setup();
    render(
      <AppShell
        currentPath="/play"
        notificationCount={4}
        notificationsContent={<p>Check in before 18:30.</p>}
        profile={profile}
        status={status}
      >
        <h1>Command centre</h1>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: /Open notifications/i }));

    expect(screen.getByRole("dialog", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("Check in before 18:30.")).toBeInTheDocument();
  });
});
