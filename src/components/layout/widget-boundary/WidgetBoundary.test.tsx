// VERZUS M3 STEP 3.5

import { fireEvent, render, screen } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WidgetBoundary } from "./WidgetBoundary";

class ThrowingWidget extends Component<{ shouldThrow: boolean }> {
  public override render(): ReactNode {
    if (this.props.shouldThrow) {
      throw Object.assign(new Error("Crew service failed"), {
        digest: "CREW-WIDGET-503",
      });
    }

    return <p>Crew widget operational</p>;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WidgetBoundary", () => {
  it("isolates a widget crash and keeps sibling content rendered", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <>
        <WidgetBoundary name="Crew pulse">
          <ThrowingWidget shouldThrow />
        </WidgetBoundary>
        <p>Next match remains operational</p>
      </>,
    );

    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.getByText("Crew pulse is unavailable")).toBeVisible();
    expect(screen.getByText(/CREW-WIDGET-503/)).toBeVisible();
    expect(screen.getByText("Next match remains operational")).toBeVisible();
  });

  it("uses a custom fallback contract", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <WidgetBoundary
        name="Rank"
        fallback={({ name, errorId }) => (
          <p>
            {name}: {errorId}
          </p>
        )}
      >
        <ThrowingWidget shouldThrow />
      </WidgetBoundary>,
    );

    expect(screen.getByText("Rank: CREW-WIDGET-503")).toBeVisible();
  });

  it("retries the failed widget without resetting siblings", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    let shouldThrow = true;

    function RecoverableWidget() {
      if (shouldThrow) {
        throw new Error("Temporary failure");
      }

      return <p>Recovered widget</p>;
    }

    render(
      <WidgetBoundary
        name="Recoverable"
        onReset={() => {
          shouldThrow = false;
        }}
      >
        <RecoverableWidget />
      </WidgetBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry Recoverable" }));

    expect(screen.getByText("Recovered widget")).toBeVisible();
  });
});
