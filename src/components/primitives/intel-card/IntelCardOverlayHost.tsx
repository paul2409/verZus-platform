"use client";

import { Modal } from "@/components/primitives/overlay";
import { CrewIntelCard } from "@/features/crews/intel-card";
import { crewIntelMock } from "@/features/crews/intel-card/crew-intel.mock";
import { PlayerIntelCard } from "@/features/profiles/intel-card";
import { playerIntelMock } from "@/features/profiles/intel-card/player-intel.mock";

import { useIntelCard } from "./IntelCardProvider";
import styles from "./IntelCardOverlayHost.module.css";

function resolveCard(type: string, id: string) {
  switch (type) {
    case "player":
      return {
        title: playerIntelMock.displayName,
        node: <PlayerIntelCard model={{ ...playerIntelMock, id }} state="default" />,
      };
    case "crew":
      return {
        title: crewIntelMock.name,
        node: <CrewIntelCard model={{ ...crewIntelMock, id }} state="default" />,
      };
    case "match":
      return {
        title: "Match intel",
        node: <p>Open the match page to view authoritative match details.</p>,
      };
    case "crewWar":
      return {
        title: "Crew war intel",
        node: <p>Crew war intel becomes available after the Crew domain cutover.</p>,
      };
    default:
      return { title: "Intel", node: null };
  }
}

export function IntelCardOverlayHost() {
  const { open, request, closeIntel } = useIntelCard();

  if (!request) {
    return null;
  }

  const resolved = resolveCard(request.type, request.id);

  return (
    <Modal
      description={`${request.type} intelligence card`}
      onOpenChange={(next) => {
        if (!next) {
          closeIntel();
        }
      }}
      open={open}
      size="lg"
      title={request.label ?? resolved.title}
    >
      <div className={styles.host}>{resolved.node}</div>
    </Modal>
  );
}
