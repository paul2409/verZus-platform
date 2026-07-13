import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

function ExampleTabs({
  activationMode = "automatic",
}: {
  activationMode?: "automatic" | "manual";
}) {
  return (
    <Tabs activationMode={activationMode} defaultValue="overview">
      <TabList aria-label="Player sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="matches">Matches</Tab>
        <Tab disabled value="locked">
          Locked
        </Tab>
        <Tab value="crew">Crew</Tab>
      </TabList>

      <TabPanel value="overview">Overview panel</TabPanel>
      <TabPanel value="matches">Matches panel</TabPanel>
      <TabPanel value="locked">Locked panel</TabPanel>
      <TabPanel value="crew">Crew panel</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders correct tab and tabpanel relationships", () => {
    render(<ExampleTabs />);

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const overviewPanel = screen.getByRole("tabpanel", { name: "Overview" });

    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(overviewTab).toHaveAttribute("aria-controls", overviewPanel.id);
    expect(overviewPanel).toHaveAttribute("aria-labelledby", overviewTab.id);
    expect(screen.getByText("Matches panel")).not.toBeVisible();
  });

  it("changes selection after a click", async () => {
    const user = userEvent.setup();
    render(<ExampleTabs />);

    await user.click(screen.getByRole("tab", { name: "Matches" }));

    expect(screen.getByRole("tab", { name: "Matches" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Matches" })).toBeVisible();
  });

  it("uses arrow keys and skips disabled tabs in automatic mode", async () => {
    const user = userEvent.setup();
    render(<ExampleTabs />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Matches" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Matches" })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Crew" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Crew" })).toHaveAttribute("aria-selected", "true");
  });

  it("requires Enter or Space to activate in manual mode", async () => {
    const user = userEvent.setup();
    render(<ExampleTabs activationMode="manual" />);

    const overview = screen.getByRole("tab", { name: "Overview" });
    overview.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Matches" })).toHaveFocus();
    expect(overview).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "Matches" })).toHaveAttribute("aria-selected", "true");
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs onValueChange={onValueChange} value="overview">
        <TabList aria-label="Controlled tabs">
          <Tab value="overview">Overview</Tab>
          <Tab value="matches">Matches</Tab>
        </TabList>
        <TabPanel value="overview">Overview panel</TabPanel>
        <TabPanel value="matches">Matches panel</TabPanel>
      </Tabs>,
    );

    await user.click(screen.getByRole("tab", { name: "Matches" }));

    expect(onValueChange).toHaveBeenCalledWith("matches");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });
});
