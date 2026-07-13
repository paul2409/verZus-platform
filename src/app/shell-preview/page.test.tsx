import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ShellPreviewPage from "./page";

describe("ShellPreviewPage", () => {
  it("renders the approved application-shell anatomy", () => {
    render(<ShellPreviewPage />);

    expect(screen.getByRole("heading", { name: "Welcome back, Jayflex" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Check-in open" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check in now" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(1);
  });
});
