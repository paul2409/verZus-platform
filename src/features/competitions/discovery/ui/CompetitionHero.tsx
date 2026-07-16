import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/primitives/icon";

import type { FeaturedCompetitionViewModel } from "../model/competition-discovery.types";
import styles from "./CompetitionDiscovery.module.css";

export type CompetitionHeroProps = {
  competition: FeaturedCompetitionViewModel;
};

export function CompetitionHero({ competition }: CompetitionHeroProps) {
  return (
    <section aria-labelledby="featured-competition-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.featuredLabel}>{competition.eyebrow}</span>
        <h2 id="featured-competition-title">{competition.name}</h2>
        <p className={styles.heroSeason}>
          {competition.seasonLabel} <span aria-hidden="true">◆</span> {competition.weekLabel}
        </p>
        <div className={styles.heroMeta}>
          <span>
            <Icon decorative name="users" size="sm" />
            {competition.gameLabel}
          </span>
          <span>
            <Icon decorative name="shield" size="sm" />
            {competition.formatLabel}
          </span>
        </div>
      </div>

      <div className={styles.heroArtwork}>
        <Image
          alt="VERZUS Championship Series trophy"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 48vw"
          src="/competitions/verzus-championship-trophy.svg"
        />
      </div>

      <div className={styles.heroPrize}>
        <span className={styles.liveBadge}>◆ {competition.statusLabel}</span>
        <p>PRIZE POOL</p>
        <strong>{competition.prizePoolLabel}</strong>
        <span>{competition.rewardNote}</span>
        <p>STARTS IN</p>
        <time dateTime="P2DT14H36M12S">{competition.countdownLabel}</time>
        <Link className={styles.primaryAction} href={`/compete/${competition.id}`}>
          VIEW DETAILS
          <Icon decorative name="chevron-right" size="sm" />
        </Link>
      </div>
    </section>
  );
}
