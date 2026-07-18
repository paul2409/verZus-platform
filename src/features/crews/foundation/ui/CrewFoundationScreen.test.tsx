// VERZUS M9.1 CREW FOUNDATION TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { xenonCrewFoundationMock } from "../mocks/crew-foundation.mock";
import { CrewFoundationScreen } from "./CrewFoundationScreen";

describe("CrewFoundationScreen", () => {
  it("renders the approved Crew identity and overview composition", () => {
    render(<CrewFoundationScreen model={xenonCrewFoundationMock} />);

    expect(screen.getByRole("heading", { name: "Xenon Esports" })).toBeVisible();
    expect(screen.getByText("We do not just play. We compete.")).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Crew sections" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "About us" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recent activity" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Top members" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Manage crew" })).toBeDisabled();
  });

  it("switches between typed foundation tabs without leaving the route", () => {
    render(<CrewFoundationScreen model={xenonCrewFoundationMock} />);

    fireEvent.click(screen.getByRole("button", { name: "Roster" }));
    expect(screen.getByRole("heading", { name: "Crew roster" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Requests/i }));
    expect(screen.getByRole("heading", { name: "Join requests" })).toBeVisible();
    expect(screen.getByText("Nova")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Crew settings" })).toBeVisible();
    expect(screen.getByText(/No mutation is enabled/i)).toBeVisible();
  });
});
