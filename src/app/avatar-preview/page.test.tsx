import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AvatarPreviewPage from "./page";

describe("AvatarPreviewPage", () => {
  it("renders the Step 11 catalogue", () => {
    render(<AvatarPreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Avatars and Identities",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("img", { name: "Large avatar, verified, busy" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Night Ravens active members" })).toBeInTheDocument();
  });

  it("renders player and Crew identity examples", () => {
    render(<AvatarPreviewPage />);

    expect(screen.getByText("@jayflex")).toBeInTheDocument();
    expect(screen.getByText("[NRV]")).toBeInTheDocument();
    expect(screen.getByText("No Crew")).toBeInTheDocument();
    expect(screen.getAllByText("Suspended").length).toBeGreaterThan(0);
  });
});
