"use client";

import { Modal } from "@/components/primitives/overlay";

import { useIntelCard } from "./IntelCardProvider";
import styles from "./IntelCardOverlayHost.module.css";

function resolveDestination(type: string, id: string): string | null {
  switch (type) {
    case "player":
      return `/players/${encodeURIComponent(id)}`;
    case "crew":
      return `/crews/${encodeURIComponent(id)}`;
    case "match":
    case "crewWar":
      return `/matches/${encodeURIComponent(id)}`;
    default:
      return null;
  }
}

export function IntelCardOverlayHost() {
  const { open, request, closeIntel } = useIntelCard();

  if (!request) return null;

  const destination = resolveDestination(request.type, request.id);

  return (
    <Modal
      description="Live entity intelligence is temporarily unavailable."
      onOpenChange={(next) => {
        if (!next) closeIntel();
      }}
      open={open}
      size="lg"
      title={request.label ?? "Entity details"}
    >
      <div className={styles.host}>
        <section aria-live="polite">
          <h3>Live intel unavailable</h3>
          <p>
            VERZUS could not load a verified intelligence snapshot. No placeholder or
            fictional record has been substituted.
          </p>
          {destination ? <a href={destination}>Open the full production record</a> : null}
        </section>
      </div>
    </Modal>
  );
}
