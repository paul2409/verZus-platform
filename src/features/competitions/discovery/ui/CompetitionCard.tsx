import Image from "next/image";

import { Icon } from "@/components/primitives/icon";

import type { CompetitionDiscoveryItem } from "../model/competition-discovery.types";
import styles from "./CompetitionDiscovery.module.css";

const artworkByKey = {
  "ea-fc": "/competitions/ea-fc-rookie-cup.svg",
  "cod-mobile": "/competitions/cod-mobile-squad-battles.svg",
  "clash-royale": "/competitions/clash-royale-ladder.svg",
  "league-of-legends": "/competitions/league-ranked-open.svg",
  championship: "/competitions/verzus-championship-trophy.svg",
} as const;

export type CompetitionCardProps = {
  competition: CompetitionDiscoveryItem;
  onSelect: (competition: CompetitionDiscoveryItem) => void;
};

export function CompetitionCard({ competition, onSelect }: CompetitionCardProps) {
  const actionLabel = competition.state === "entered" ? "MANAGE" : "VIEW";

  return (
    <article className={styles.competitionCard} data-state={competition.state}>
      <div className={styles.cardArtwork}>
        <Image
          alt=""
          fill
          sizes="(max-width: 767px) 38vw, 180px"
          src={artworkByKey[competition.artKey]}
        />
        <span className={styles.cardStatus}>{competition.statusLabel}</span>
      </div>

      <div className={styles.cardIdentity}>
        <h3>{competition.name}</h3>
        <p>
          {competition.teamSize} <span aria-hidden="true">•</span> {competition.format}
        </p>
        <span>
          <Icon decorative name="users" size="xs" />
          {competition.capacityLabel}
        </span>
      </div>

      <div className={styles.cardMetric}>
        <span>{competition.prizePoolLabel ? "PRIZE POOL" : "STARTS IN"}</span>
        <strong>{competition.prizePoolLabel ?? competition.timingLabel}</strong>
      </div>

      <div className={styles.cardMetric}>
        <span>{competition.prizePoolLabel ? "STARTED" : "ENTRY FEE"}</span>
        <strong>
          {competition.prizePoolLabel ? competition.timingLabel : competition.entryFeeLabel}
        </strong>
      </div>

      <button
        className={styles.cardAction}
        data-action={competition.state === "entered" ? "manage" : "view"}
        onClick={() => onSelect(competition)}
        type="button"
      >
        {actionLabel}
      </button>
    </article>
  );
}
