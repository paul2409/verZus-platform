import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("renders an accessible group", () => {
    render(
      <ButtonGroup label="Match actions">
        <Button>Check in</Button>
        <Button variant="secondary">View match</Button>
      </ButtonGroup>,
    );

    const group = screen.getByRole("group", {
      name: "Match actions",
    });

    expect(
      within(group).getByRole("button", {
        name: "Check in",
      }),
    ).toBeInTheDocument();

    expect(
      within(group).getByRole("button", {
        name: "View match",
      }),
    ).toBeInTheDocument();
  });

  it("exposes its orientation", () => {
    render(
      <ButtonGroup label="Profile actions" orientation="vertical">
        <Button>Save</Button>
      </ButtonGroup>,
    );

    expect(
      screen.getByRole("group", {
        name: "Profile actions",
      }),
    ).toHaveAttribute("data-button-group-orientation", "vertical");
  });
});
