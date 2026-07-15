// VERZUS M5 STEPS 5.9-5.13

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PlayCheckInAction } from "../actions/use-play-check-in";
import type { CurrentCheckIn } from "../model";
import type { PlayWidgetView } from "../view-model";
import { CheckInControl } from "./CheckInControl";

const checkIn: CurrentCheckIn = {
  matchId: "match-week-14-001",
  state: "open",
  opensAt: "2026-07-15T18:15:00.000Z",
  closesAt: "2026-07-15T18:55:00.000Z",
  checkedInAt: null,
  serverNow: "2026-07-15T18:20:00.000Z",
  canCheckIn: true,
  mutationKey: "check-in-match-week-14-001",
};

function view(): PlayWidgetView<CurrentCheckIn> {
  return {
    id: "check-in",
    state: "success",
    data: checkIn,
    errorCode: null,
    requestId: null,
    available: true,
    stale: false,
  };
}

function action(overrides: Partial<PlayCheckInAction> = {}): PlayCheckInAction {
  return {
    state: "idle",
    errorCode: null,
    requestId: null,
    checkIn: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe("CheckInControl", () => {
  it("submits the current server mutation key", async () => {
    const user = userEvent.setup();
    const checkInAction = action();

    render(<CheckInControl view={view()} match={null} action={checkInAction} onRetry={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "CHECK IN NOW" }));

    expect(checkInAction.checkIn).toHaveBeenCalledTimes(1);
    expect(checkInAction.checkIn).toHaveBeenCalledWith(checkIn);
  });

  it("disables duplicate interaction while pending", () => {
    render(
      <CheckInControl
        view={view()}
        match={null}
        action={action({ state: "pending" })}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "CHECKING IN..." })).toBeDisabled();
  });

  it("shows a traceable mutation error", () => {
    render(
      <CheckInControl
        view={view()}
        match={null}
        action={action({
          state: "error",
          errorCode: "stale_check_in_state",
          requestId: "request-17",
        })}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("stale_check_in_state · request-17");
  });
});
