// VERZUS M9.4 CREW RESOURCE STATUS COMPONENT TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CrewResourceHealth, CrewResourceName } from "../model/crew-resource.types";
import { crewResourceNames } from "../model/crew-resource.types";
import { CrewResourceStatusStrip } from "./CrewResourceStatusStrip";

function health(state: CrewResourceHealth["state"]): Record<CrewResourceName, CrewResourceHealth> {
  return Object.fromEntries(
    crewResourceNames.map((name) => [
      name,
      { name, state, requestId: null, message: null, retryable: true },
    ]),
  ) as Record<CrewResourceName, CrewResourceHealth>;
}

describe("CrewResourceStatusStrip", () => {
  it("shows all seven independent Crew resources", () => {
    render(<CrewResourceStatusStrip health={health("success")} onRetry={vi.fn()} />);
    expect(screen.getAllByText("success")).toHaveLength(7);
    expect(screen.getByText("Roster")).toBeVisible();
    expect(screen.getByText("Achievements")).toBeVisible();
  });

  it("retries only the selected failed resource", () => {
    const onRetry = vi.fn();
    const states = health("success");
    states.roster = { ...states.roster, state: "error" };
    render(<CrewResourceStatusStrip health={states} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledWith("roster");
  });
});
