import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsScreen } from "./SettingsScreen";

describe("SettingsScreen", () => {
  it("renders account, signal, privacy, and competition settings", () => {
    render(<SettingsScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "SETTINGS" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Competitive alerts" })).toBeChecked();
    expect(screen.getByText("VS Points")).toBeInTheDocument();
  });
});
