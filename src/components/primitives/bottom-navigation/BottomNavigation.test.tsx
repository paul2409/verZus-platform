import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BottomNavigation, BottomNavigationItem, NavigationBadge } from "./BottomNavigation";

function IconStub() {
  return <svg aria-hidden="true" data-testid="icon-stub" />;
}

describe("BottomNavigation", () => {
  it("renders a labelled semantic navigation region", () => {
    render(
      <BottomNavigation label="Mobile primary" position="static">
        <BottomNavigationItem href="/play" icon={<IconStub />} label="Play" />
      </BottomNavigation>,
    );

    expect(screen.getByRole("navigation", { name: "Mobile primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play" })).toHaveAttribute("href", "/play");
  });

  it("marks the active destination as the current page", () => {
    render(
      <BottomNavigation position="static">
        <BottomNavigationItem current href="/play" icon={<IconStub />} label="Play" />
      </BottomNavigation>,
    );

    const link = screen.getByRole("link", { name: "Play" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.closest("li")).toHaveAttribute("data-navigation-current", "true");
  });

  it("prevents navigation and removes disabled destinations from tab order", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <BottomNavigation position="static">
        <BottomNavigationItem
          href="/rewards"
          icon={<IconStub />}
          label="Rewards"
          onClick={onClick}
          state="disabled"
        />
      </BottomNavigation>,
    );

    const link = screen.getByRole("link", { name: /Rewards/ });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes partial availability and offline-safety metadata", () => {
    render(
      <BottomNavigation position="static">
        <BottomNavigationItem
          href="/crew"
          icon={<IconStub />}
          label="Crew"
          offlineSafe={false}
          state="partial"
        />
      </BottomNavigation>,
    );

    const item = screen.getByRole("link", { name: /Crew/ }).closest("li");
    expect(item).toHaveAttribute("data-navigation-state", "partial");
    expect(item).toHaveAttribute("data-navigation-offline-safe", "false");
    expect(screen.getByText("Partially available.")).toBeInTheDocument();
  });

  it("supports count and dot notification badges", () => {
    render(
      <>
        <NavigationBadge count={128} max={99} />
        <NavigationBadge dot label="New Crew activity" tone="primary" />
      </>,
    );

    expect(screen.getByRole("status", { name: "128 unread notifications" })).toHaveTextContent(
      "99+",
    );
    expect(screen.getByRole("status", { name: "New Crew activity" })).toHaveAttribute(
      "data-navigation-badge-kind",
      "dot",
    );
  });

  it("does not render a zero-count badge", () => {
    const { container } = render(<NavigationBadge count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes layout, variant, position and safe-area contracts", () => {
    render(
      <BottomNavigation
        items={4}
        label="Four item navigation"
        position="fixed"
        safeArea={false}
        variant="floating"
      >
        <BottomNavigationItem href="/one" icon={<IconStub />} label="One" />
      </BottomNavigation>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Four item navigation",
    });

    expect(navigation).toHaveAttribute("data-bottom-navigation-items", "4");
    expect(navigation).toHaveAttribute("data-bottom-navigation-position", "fixed");
    expect(navigation).toHaveAttribute("data-bottom-navigation-safe-area", "false");
    expect(navigation).toHaveAttribute("data-bottom-navigation-variant", "floating");
  });
});
