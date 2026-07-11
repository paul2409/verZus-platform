import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the repository as the M1 foundation", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "VERZUS foundation" })).toBeInTheDocument();
    expect(screen.getByText("Milestone M1")).toBeInTheDocument();
    expect(screen.getByText("/api/health")).toBeInTheDocument();
  });
});
