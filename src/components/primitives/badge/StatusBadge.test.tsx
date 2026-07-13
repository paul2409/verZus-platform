import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("does not create a live region by default", () => {
    render(<StatusBadge status="online">Online</StatusBadge>);

    const badge = screen.getByText("Online").closest("span[data-status]");

    expect(badge).toHaveAttribute("data-status", "online");
    expect(badge).not.toHaveAttribute("role");
    expect(badge).not.toHaveAttribute("aria-live");
    expect(badge?.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("can announce a changing status politely", () => {
    render(
      <StatusBadge announce status="loading">
        Updating rankings
      </StatusBadge>,
    );

    const status = screen.getByRole("status");

    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("data-status", "loading");
    expect(status).toHaveAttribute("data-status-pulse", "true");
  });
});
