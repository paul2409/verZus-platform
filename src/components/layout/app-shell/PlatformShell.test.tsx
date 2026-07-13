import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlatformShell } from "./PlatformShell";

const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("PlatformShell", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/matches/m-1487");
  });

  it("derives the active route from Next navigation without feature data", () => {
    render(
      <PlatformShell>
        <p>Route content</p>
      </PlatformShell>,
    );

    expect(screen.getByText("Route content")).toBeInTheDocument();
    expect(
      screen
        .getAllByText("Matches")
        .some((element) => element.closest("a")?.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });
});
