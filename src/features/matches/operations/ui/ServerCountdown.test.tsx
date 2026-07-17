// VERZUS M7.2 SERVER-ANCHORED COUNTDOWN TESTS

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { ServerCountdown } from "./ServerCountdown";

describe("ServerCountdown", () => {
  const now = new Date("2026-07-16T20:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders from the server anchor instead of local deadline authority", () => {
    const clock = createMatchClockSnapshot("match-7", "check-in-open", now);

    render(
      <ServerCountdown caption="Check-in ends · server time" clock={clock} fallbackLabel={null} />,
    );

    expect(screen.getByTestId("server-countdown")).toHaveTextContent("00H 24M 13S");
    expect(screen.getByLabelText("Server-authoritative match clock")).toHaveAttribute(
      "data-server-authoritative",
      "true",
    );
  });

  it("ticks display time without changing the authoritative deadline", () => {
    const clock = createMatchClockSnapshot("match-7", "check-in-open", now);

    render(<ServerCountdown caption={null} clock={clock} fallbackLabel={null} />);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByTestId("server-countdown")).toHaveTextContent("00H 24M 11S");
    expect(clock.activeDeadlineAt).toBe("2026-07-16T20:24:13.000Z");
  });
});
