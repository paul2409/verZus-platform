import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavigationList } from "./NavigationList";
import type { ShellNavigationItem } from "./shell.types";

const items: readonly ShellNavigationItem[] = [
  {
    id: "leaderboards",
    href: "/leaderboards/weekly",
    label: "Leaderboards",
    icon: "trophy",
    activePrefixes: ["/leaderboards"],
  },
  {
    id: "rewards",
    href: "/rewards",
    label: "Rewards",
    icon: "gift",
    featureFlag: "rewards",
  },
  {
    id: "notifications",
    href: "/notifications",
    label: "Notifications",
    icon: "bell",
    notification: { count: 12, label: "12 unread notifications" },
  },
];

describe("NavigationList", () => {
  it("marks nested routes as current", () => {
    render(<NavigationList currentPath="/leaderboards/crew" items={items} />);

    expect(screen.getByRole("link", { name: "Leaderboards" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("removes feature-flagged destinations from keyboard navigation", () => {
    render(<NavigationList currentPath="/play" featureFlags={{ rewards: false }} items={items} />);

    expect(screen.queryByRole("link", { name: /Rewards/ })).not.toBeInTheDocument();
    expect(screen.getByText("Rewards").closest("span[aria-disabled='true']")).toHaveAttribute(
      "data-navigation-state",
      "feature-flagged",
    );
    expect(screen.getByText("This feature is not enabled.")).toBeInTheDocument();
  });

  it("exposes notification counts with an accessible label", () => {
    render(<NavigationList currentPath="/play" items={items} />);

    expect(screen.getByRole("status", { name: "12 unread notifications" })).toHaveTextContent("12");
  });

  it("keeps degraded destinations reachable but identifies the error state", () => {
    render(
      <NavigationList
        currentPath="/play"
        items={items}
        runtimeStates={{ leaderboards: "error" }}
      />,
    );

    const link = screen.getByRole("link", { name: /Leaderboards/ });
    expect(link).toHaveAttribute("data-navigation-state", "error");
    expect(link).toHaveAttribute("href", "/leaderboards/weekly");
  });

  it("disables network-required destinations while offline", () => {
    render(<NavigationList currentPath="/play" items={items} offline />);

    expect(screen.queryByRole("link", { name: /Leaderboards/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Unavailable while offline.").length).toBeGreaterThan(0);
  });
});
