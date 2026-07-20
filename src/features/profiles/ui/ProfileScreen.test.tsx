// VERZUS M11.1 PROFILE SCREEN REGRESSION TEST

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileScreen } from "./ProfileScreen";

describe("ProfileScreen", () => {
  it("renders the own-player identity and confirmed profile statistics", () => {
    render(<ProfileScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "Prismo" })).toBeInTheDocument();
    expect(screen.getByText("312")).toBeInTheDocument();
    expect(screen.getByText("Xenon Esports")).toBeInTheDocument();
  });
});
