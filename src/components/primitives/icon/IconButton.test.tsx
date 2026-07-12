import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an accessible icon-only button", () => {
    render(<IconButton icon="search" label="Open search" />);

    expect(
      screen.getByRole("button", {
        name: "Open search",
      }),
    ).toBeInTheDocument();
  });

  it("calls its click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<IconButton icon="bell" label="Open notifications" onClick={onClick} />);

    await user.click(
      screen.getByRole("button", {
        name: "Open notifications",
      }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks interaction while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<IconButton disabled icon="settings" label="Open settings" onClick={onClick} />);

    const button = screen.getByRole("button", {
      name: "Open settings",
    });

    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("blocks interaction while loading", () => {
    render(<IconButton icon="refresh-cw" label="Refresh rankings" loading />);

    const button = screen.getByRole("button", {
      name: "Refresh rankings",
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("forwards pressed state", () => {
    render(<IconButton aria-pressed="true" icon="bell" label="Notifications enabled" />);

    expect(
      screen.getByRole("button", {
        name: "Notifications enabled",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
