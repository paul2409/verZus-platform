import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Play now</Button>);

    expect(screen.getByRole("button", { name: "Play now" })).toBeInTheDocument();
  });

  it("calls the click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Join competition</Button>);

    await user.click(screen.getByRole("button", { name: "Join competition" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call the click handler while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Disabled action
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Disabled action" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables interaction while loading", () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole("button", { name: "Saving" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("forwards native button attributes", () => {
    render(
      <Button type="submit" name="match-action" value="check-in" variant="secondary">
        Check in
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Check in" });

    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "match-action");
    expect(button).toHaveAttribute("value", "check-in");
  });

  it("renders leading and trailing icons", () => {
    render(
      <Button
        leadingIcon={<span data-testid="leading-icon">L</span>}
        trailingIcon={<span data-testid="trailing-icon">R</span>}
      >
        Continue
      </Button>,
    );

    expect(screen.getByTestId("leading-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trailing-icon")).toBeInTheDocument();
  });
});
