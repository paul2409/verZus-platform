import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Toast, ToastViewport } from "./Toast";

describe("Toast", () => {
  it("renders inside a labelled viewport", () => {
    render(
      <ToastViewport label="System notifications" placement="top-right">
        <Toast title="Match saved" tone="success" />
      </ToastViewport>,
    );

    const viewport = screen.getByRole("list", { name: "System notifications" });
    expect(viewport).toHaveAttribute("data-toast-placement", "top-right");
    expect(screen.getByRole("status")).toHaveTextContent("Match saved");
  });

  it("uses alert semantics for errors", () => {
    render(<Toast title="Submission failed" tone="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Submission failed");
  });

  it("can disable automatic announcements", () => {
    render(<Toast announce={false} title="Quiet update" />);
    expect(screen.getByText("Quiet update").closest("li")).not.toHaveAttribute("role");
  });

  it("calls the dismiss handler", () => {
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss} title="Dismissible" />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
