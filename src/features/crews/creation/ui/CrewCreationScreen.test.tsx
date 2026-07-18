// VERZUS M9.3 CREW CREATION SCREEN TESTS

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CrewCreationScreen } from "./CrewCreationScreen";

const navigation = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/crews/create",
  useRouter: () => navigation,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: string }) => (
    <span aria-label={alt || undefined} data-image-src={String(src ?? "")} />
  ),
}));

describe("CrewCreationScreen", () => {
  beforeEach(() => {
    window.localStorage.clear();
    navigation.push.mockClear();
    navigation.replace.mockClear();
  });

  it("renders the five-step no-Crew creation flow", async () => {
    render(<CrewCreationScreen initialStep="basics" membership="none" />);

    expect(
      await screen.findByRole("heading", { name: "Build your competitive identity" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Crew basics" })).toBeVisible();
    expect(screen.getByRole("list", { name: "Crew creation progress" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Your Crew name" })).toBeVisible();
  });

  it("advances from valid basics to identity assets", async () => {
    const user = userEvent.setup();
    render(<CrewCreationScreen initialStep="basics" membership="none" />);

    await user.type(await screen.findByLabelText("Crew name"), "Night Shift Elite");
    await user.type(screen.getByLabelText("Crew tag"), "nse");
    await user.type(
      screen.getByPlaceholderText("Describe your Crew culture, goals and competitive identity."),
      "A disciplined late-night Crew for verified competitive play.",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { name: "Identity assets" })).toBeVisible();
    expect(navigation.push).toHaveBeenCalledWith("/crews/create?membership=none&step=identity", {
      scroll: false,
    });
  });

  it("blocks creation for an existing Crew member", () => {
    render(<CrewCreationScreen initialStep="basics" membership="current" />);

    expect(screen.getByRole("heading", { name: "You already belong to a Crew" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Return to My Crew" })).toHaveAttribute(
      "href",
      "/crews",
    );
  });
});
