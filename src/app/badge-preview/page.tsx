import {
  Badge,
  MovementBadge,
  RankBadge,
  StatValue,
  StatusBadge,
} from "@/components/primitives/badge";
import {
  Panel,
  PanelDescription,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelModule,
  PanelModuleBody,
  PanelModuleHeader,
  PanelTitle,
} from "@/components/primitives/panel";

import styles from "./page.module.css";

const badgeTones = [
  "neutral",
  "information",
  "positive",
  "warning",
  "negative",
  "special",
  "live",
] as const;

const statuses = ["online", "offline", "away", "busy", "live", "loading"] as const;

const ranks = [
  { rank: 24, tier: "standard" },
  { rank: 3, tier: "bronze" },
  { rank: 2, tier: "silver" },
  { rank: 1, tier: "gold" },
  { rank: "S", tier: "elite" },
] as const;

export default function BadgePreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>VERZUS Design System · Step 10</p>
        <h1 className={styles.title}>Badges and Status</h1>
        <p className={styles.description}>
          Compact competitive indicators for rankings, presence, live operations, movement, and
          numeric performance.
        </p>
      </header>

      <Panel aria-labelledby="badge-heading" density="spacious" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="badge-heading">Badge Catalogue</PanelTitle>
            <PanelDescription>
              Soft, solid, and outline treatments remain readable inside cards and panels.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Semantic tones</h2>
          <div className={styles.wrap}>
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Variants and sizes</h2>
          <div className={styles.wrap}>
            <Badge size="sm" tone="information" variant="outline">
              Small outline
            </Badge>
            <Badge tone="positive" variant="solid">
              Ready
            </Badge>
            <Badge size="lg" tone="warning">
              Check-in closes
            </Badge>
            <Badge disabled>Unavailable</Badge>
          </div>
        </div>
      </Panel>

      <Panel aria-labelledby="status-heading" density="spacious" tone="secondary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="status-heading">Operational Indicators</PanelTitle>
            <PanelDescription>
              Status, ranking movement, and performance values share the same mechanical language.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelGrid columns={2}>
          <PanelModule aria-label="Presence statuses" state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Presence and lifecycle</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.wrap}>
                {statuses.map((status) => (
                  <StatusBadge key={status} status={status}>
                    {status}
                  </StatusBadge>
                ))}
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Rank badge tiers" state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Rank tiers</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.rankRow}>
                {ranks.map(({ rank, tier }) => (
                  <RankBadge key={tier} rank={rank} tier={tier} />
                ))}
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Ranking movement" state="stale">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Ranking movement</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.wrap}>
                <MovementBadge movement="increased" value={3} />
                <MovementBadge movement="decreased" value={2} />
                <MovementBadge movement="unchanged" />
                <MovementBadge movement="new" />
                <MovementBadge movement="unranked" />
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Performance statistics" state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Performance statistics</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.statGrid}>
                <StatValue
                  detail="Current season"
                  label="Rank"
                  size="xl"
                  tone="warning"
                  value="#04"
                />
                <StatValue
                  detail="18 wins · 4 losses"
                  label="Record"
                  size="lg"
                  tone="positive"
                  value="18–4"
                />
                <StatValue
                  detail="Across 22 matches"
                  label="Win rate"
                  size="lg"
                  suffix="%"
                  tone="information"
                  value="81.8"
                />
                <StatValue
                  detail="No active penalty"
                  label="Fair-play"
                  size="lg"
                  tone="special"
                  value="A+"
                />
              </div>
            </PanelModuleBody>
          </PanelModule>
        </PanelGrid>
      </Panel>
    </main>
  );
}
