import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardBody,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardMedia,
  CardStat,
  CardStats,
  CardTitle,
} from "./Card";

describe("Card", () => {
  it("renders an accessible semantic article", () => {
    render(
      <Card aria-label="JAYFLEX player card">
        <CardHeader>
          <CardEyebrow>Featured player</CardEyebrow>

          <CardTitle>JAYFLEX</CardTitle>

          <CardDescription>Ranked EA FC competitor</CardDescription>
        </CardHeader>
      </Card>,
    );

    const card = screen.getByRole("article", {
      name: "JAYFLEX player card",
    });

    expect(card).toBeInTheDocument();

    expect(
      within(card).getByRole("heading", {
        name: "JAYFLEX",
      }),
    ).toBeInTheDocument();

    expect(card).toHaveTextContent("Featured player");
    expect(card).toHaveTextContent("Ranked EA FC competitor");
  });

  it("exposes stable visual configuration attributes", () => {
    render(
      <Card
        aria-label="Legendary crew card"
        density="featured"
        foil
        interactive
        layout="portrait"
        rarity="legendary"
        selected
        tone="accent"
      >
        Crew identity
      </Card>,
    );

    const card = screen.getByRole("article", {
      name: "Legendary crew card",
    });

    expect(card).toHaveAttribute("data-card-layout", "portrait");

    expect(card).toHaveAttribute("data-card-tone", "accent");

    expect(card).toHaveAttribute("data-card-rarity", "legendary");

    expect(card).toHaveAttribute("data-card-density", "featured");

    expect(card).toHaveAttribute("data-card-foil", "true");

    expect(card).toHaveAttribute("data-card-interactive", "true");

    expect(card).toHaveAttribute("data-card-selected", "true");
  });

  it("renders the complete trading-card composition", () => {
    const { container } = render(
      <Card aria-label="Complete match card">
        <CardHeader>
          <CardTitle>Next match</CardTitle>
        </CardHeader>

        <CardMedia aspect="landscape" overlay={<span>Live</span>}>
          <div>Match artwork</div>
        </CardMedia>

        <CardBody>
          <p>JAYFLEX versus R3DSTORM</p>
        </CardBody>

        <CardStats>
          <CardStat detail="Current season" label="Rank" value="#4" />

          <CardStat label="Record" value="18W–4L" />
        </CardStats>

        <CardFooter>
          <button type="button">Open match</button>
        </CardFooter>
      </Card>,
    );

    const card = screen.getByRole("article", {
      name: "Complete match card",
    });

    const expectedSlots = ["header", "title", "media", "body", "stats", "stat", "footer"];

    for (const slot of expectedSlots) {
      expect(card.querySelector(`[data-card-slot="${slot}"]`)).toBeInTheDocument();
    }

    expect(container.querySelector('[data-card-media-aspect="landscape"]')).toBeInTheDocument();

    expect(card).toHaveTextContent("Live");
    expect(card).toHaveTextContent("#4");
    expect(card).toHaveTextContent("18W–4L");

    expect(
      within(card).getByRole("button", {
        name: "Open match",
      }),
    ).toBeInTheDocument();
  });

  it("supports a configurable title heading level", () => {
    render(
      <Card aria-label="Nested card">
        <CardTitle as="h4">Nested module heading</CardTitle>
      </Card>,
    );

    expect(
      screen.getByRole("heading", {
        level: 4,
        name: "Nested module heading",
      }),
    ).toBeInTheDocument();
  });

  it("hides frame decorations from assistive technology", () => {
    const { container } = render(
      <Card aria-label="Foil card" foil>
        Foil content
      </Card>,
    );

    const decorativeLayers = container.querySelectorAll('[aria-hidden="true"]');

    expect(decorativeLayers.length).toBeGreaterThanOrEqual(7);

    for (const layer of decorativeLayers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("does not make an interactive card a fake button", () => {
    render(
      <Card aria-label="Interactive card shell" interactive>
        <CardFooter>
          <button type="button">Select card</button>
        </CardFooter>
      </Card>,
    );

    const card = screen.getByRole("article", {
      name: "Interactive card shell",
    });

    expect(card).not.toHaveAttribute("role", "button");
    expect(card).not.toHaveAttribute("tabindex");

    expect(
      within(card).getByRole("button", {
        name: "Select card",
      }),
    ).toBeInTheDocument();
  });
});
