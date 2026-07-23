import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavigationList } from "./NavigationList";
import type { ShellNavigationItem } from "./shell.types";

const items: readonly ShellNavigationItem[] = [
  { id: "play", href: "/play", label: "Play", icon: "gamepad", section: "main" },
  { id: "crews", href: "/crews", label: "Crews", icon: "users", section: "community" },
  { id: "profile", href: "/profile", label: "Profile", icon: "user", section: "account" },
];

describe("NavigationList sections", () => {
  it("renders scan-friendly section labels in the full sidebar", () => {
    render(<NavigationList currentPath="/play" items={items} />);

    expect(screen.getByText("MAIN")).toBeVisible();
    expect(screen.getByText("COMMUNITY")).toBeVisible();
    expect(screen.getByText("ACCOUNT")).toBeVisible();
  });

  it("does not inject section labels into compact navigation", () => {
    render(<NavigationList compact currentPath="/play" items={items} />);

    expect(screen.queryByText("MAIN")).not.toBeInTheDocument();
    expect(screen.queryByText("COMMUNITY")).not.toBeInTheDocument();
    expect(screen.queryByText("ACCOUNT")).not.toBeInTheDocument();
  });
});
