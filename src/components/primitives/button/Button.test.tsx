import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button with a safe default type", () => {
    render(<Button>Check in now</Button>);

    expect(
      screen.getByRole("button", {
        name: "Check in now",
      }),
    ).toHaveAttribute("type", "button");
  });

  it("supports an explicit submit type", () => {
    render(<Button type="submit">Save profile</Button>);

    expect(
      screen.getByRole("button", {
        name: "Save profile",
      }),
    ).toHaveAttribute("type", "submit");
  });

  it("calls its click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Open match</Button>);

    await user.click(
      screen.getByRole("button", {
        name: "Open match",
      }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports leading and trailing icons", () => {
    const { container } = render(
      <Button leadingIcon="trophy" trailingIcon="chevron-right">
        View rankings
      </Button>,
    );

    expect(container.querySelector('[data-icon="trophy"]')).toBeInTheDocument();

    expect(container.querySelector('[data-icon="chevron-right"]')).toBeInTheDocument();
  });

  it("blocks interaction while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Unavailable
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Unavailable",
    });

    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes an accessible loading state", () => {
    render(
      <Button loading loadingLabel="Checking in">
        Check in now
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Checking in",
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("exposes stable variant and size attributes", () => {
    render(
      <Button size="lg" variant="danger">
        Report issue
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Report issue",
    });

    expect(button).toHaveAttribute("data-button-variant", "danger");

    expect(button).toHaveAttribute("data-button-size", "lg");
  });
});
