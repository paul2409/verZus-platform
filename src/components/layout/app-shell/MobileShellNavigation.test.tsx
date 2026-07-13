import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileShellNavigation } from "./MobileShellNavigation";
import type { ShellNavigationItem } from "./shell.types";

const items: readonly ShellNavigationItem[] = [
  { id: "play", href: "/play", label: "Play", icon: "gamepad", offlineSafe: true },
  { id: "compete", href: "/compete", label: "Compete", icon: "swords" },
  { id: "crews", href: "/crews", label: "Crews", icon: "users" },
  { id: "rewards", href: "/rewards", label: "Rewards", icon: "gift" },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    icon: "user",
    activePrefixes: ["/players"],
    offlineSafe: true,
  },
];

describe("MobileShellNavigation", () => {
  it("supports nested current-route matching", () => {
    render(<MobileShellNavigation currentPath="/players/jayflex" items={items} />);

    expect(screen.getByRole("link", { name: /Profile/ })).toHaveAttribute("aria-current", "page");
  });

  it("disables network-required destinations in offline mode", () => {
    render(<MobileShellNavigation currentPath="/play" items={items} offline />);

    expect(screen.getByRole("link", { name: /Compete/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /Play/ })).not.toHaveAttribute("aria-disabled");
  });
});
