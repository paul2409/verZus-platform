import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotificationsScreen } from "./NotificationsScreen";

describe("NotificationsScreen", () => {
  it("renders the competitive signal feed", () => {
    render(<NotificationsScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "NOTIFICATIONS" })).toBeInTheDocument();
    expect(screen.getByText("Check-in opens in 30 minutes")).toBeInTheDocument();
    expect(screen.getByText("Reward pool funded")).toBeInTheDocument();
  });
});
