import type { Meta, StoryObj } from "@storybook/react";

import { CrewIntelCard, crewIntelMock } from "@/features/crews/intel-card";
import {
  MatchIntelCard,
  WarMatchIntelCard,
  matchIntelMock,
  warMatchIntelMock,
} from "@/features/matches/intel-card";
import { PlayerIntelCard, playerIntelMock } from "@/features/profiles/intel-card";

import styles from "./IntelCards.module.css";

const meta = {
  title: "Design System/Intel Cards",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntelCardsBaseline: Story = {
  render: () => (
    <main className={styles.frame!} data-visual-ready="true">
      <header className={styles.header!}>
        <p>M2 / Step 19</p>
        <h1>Intel Cards</h1>
      </header>
      <div className={styles.grid!}>
        <PlayerIntelCard model={playerIntelMock} />
        <MatchIntelCard model={matchIntelMock} />
        <CrewIntelCard model={crewIntelMock} />
        <WarMatchIntelCard model={warMatchIntelMock} />
      </div>
    </main>
  ),
};
