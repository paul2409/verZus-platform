// VERZUS M3 STEP 3.6

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShellProfileMenu } from "./ShellProfileMenu";

const profile = {
  name: "Jayflex",
  handle: "jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online",
  points: 2840,
  crewName: "Mainland Titans",
} as const;

describe("ShellProfileMenu", () => {
  it("opens accessible profile destinations", () => {
    render(<ShellProfileMenu profile={profile} routeKey="/play" />);

    fireEvent.click(screen.getByRole("button", { name: "Open profile menu" }));

    expect(screen.getByLabelText("Profile menu")).toBeVisible();
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "Account settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("closes when the route key changes", () => {
    const { rerender } = render(<ShellProfileMenu profile={profile} routeKey="/play" />);

    fireEvent.click(screen.getByRole("button", { name: "Open profile menu" }));
    expect(screen.getByLabelText("Profile menu")).toBeVisible();

    rerender(<ShellProfileMenu profile={profile} routeKey="/profile" />);

    expect(screen.queryByLabelText("Profile menu")).not.toBeInTheDocument();
  });
});
