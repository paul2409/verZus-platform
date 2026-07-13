import { Badge, RankBadge, StatusBadge } from "@/components/primitives/badge";
import {
  Avatar,
  AvatarGroup,
  CrewIdentity,
  PlayerIdentity,
  type AvatarGroupItem,
} from "@/components/primitives/avatar";
import {
  Panel,
  PanelDescription,
  PanelEyebrow,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelModule,
  PanelModuleBody,
  PanelModuleHeader,
  PanelTitle,
} from "@/components/primitives/panel";

import styles from "./page.module.css";

function PlayerMark({ variant }: { variant: "bolt" | "crown" | "flame" }) {
  if (variant === "bolt") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path className={styles.markBack} d="M32 3 58 18v28L32 61 6 46V18Z" />
        <path className={styles.markAccent} d="M38 8 17 36h13l-4 20 21-29H34Z" />
      </svg>
    );
  }

  if (variant === "crown") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path className={styles.markBack} d="M32 3 58 18v28L32 61 6 46V18Z" />
        <path className={styles.markAccent} d="m14 22 11 9 7-16 7 16 11-9-5 26H19Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <path className={styles.markBack} d="M32 3 58 18v28L32 61 6 46V18Z" />
      <path
        className={styles.markAccent}
        d="M34 11c4 12-5 13 3 22 4-8 10-8 10 2 0 11-7 18-15 18S17 46 17 35c0-8 5-13 11-20-1 10 3 12 6 15 3-6 4-11 0-19Z"
      />
    </svg>
  );
}

function CrewMark({ variant }: { variant: "raven" | "wolf" | "voltage" }) {
  if (variant === "raven") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path className={styles.markBack} d="M32 3 59 32 32 61 5 32Z" />
        <path
          className={styles.markAccent}
          d="m13 24 17 5 2-14 4 15 16-6-11 13 8 11-14-4-3 13-4-13-14 4 9-11Z"
        />
      </svg>
    );
  }

  if (variant === "wolf") {
    return (
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path className={styles.markBack} d="M32 3 59 32 32 61 5 32Z" />
        <path className={styles.markAccent} d="m14 20 12-9 6 10 6-10 12 9-4 27-14 11-14-11Z" />
        <path className={styles.markEye} d="m21 31 8 3-9 2Zm22 0-8 3 9 2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <path className={styles.markBack} d="M32 3 59 32 32 61 5 32Z" />
      <path className={styles.markAccent} d="M38 8 17 36h13l-4 20 21-29H34Z" />
    </svg>
  );
}

const groupItems: AvatarGroupItem[] = [
  { id: "jay", name: "Jay Flex", tone: "green", visual: <PlayerMark variant="bolt" /> },
  { id: "storm", name: "Red Storm", tone: "red", visual: <PlayerMark variant="flame" /> },
  { id: "nova", name: "Nova King", tone: "cyan", visual: <PlayerMark variant="crown" /> },
  { id: "kemi", name: "Kemi Strike", tone: "gold" },
  { id: "arc", name: "Arc Wolf", tone: "violet" },
];

export default function AvatarPreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.kicker}>VERZUS Design System / M2 / Step 11</p>
        <h1 className={styles.pageTitle}>Avatars and Identities</h1>
        <p className={styles.pageDescription}>
          Accessible player portraits, Crew emblems, grouped members and reusable identity rows.
        </p>
      </header>

      <Panel aria-labelledby="avatar-catalogue" density="spacious" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Identity foundation</PanelEyebrow>
            <PanelTitle id="avatar-catalogue">Avatar Catalogue</PanelTitle>
            <PanelDescription>
              Sizes, shapes, presence, verification, loading and restricted states.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelGrid columns={2}>
          <PanelModule state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Player sizes</h2>
              <StatusBadge status="online">Online</StatusBadge>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.avatarRow}>
                <Avatar
                  name="Extra small"
                  size="xs"
                  tone="green"
                  visual={<PlayerMark variant="bolt" />}
                />
                <Avatar
                  name="Small"
                  presence="online"
                  size="sm"
                  tone="cyan"
                  visual={<PlayerMark variant="crown" />}
                />
                <Avatar
                  name="Medium"
                  presence="away"
                  size="md"
                  tone="gold"
                  visual={<PlayerMark variant="flame" />}
                />
                <Avatar
                  name="Large"
                  presence="busy"
                  size="lg"
                  tone="red"
                  verified
                  visual={<PlayerMark variant="bolt" />}
                />
                <Avatar
                  name="Extra large"
                  presence="offline"
                  size="xl"
                  tone="violet"
                  visual={<PlayerMark variant="crown" />}
                />
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule state="idle">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Crew shapes</h2>
              <Badge tone="special">Original emblems</Badge>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.avatarRow}>
                <Avatar
                  name="Night Ravens"
                  shape="hex"
                  size="lg"
                  tone="violet"
                  verified
                  visual={<CrewMark variant="raven" />}
                />
                <Avatar
                  name="Iron Wolves"
                  shape="hex"
                  size="lg"
                  tone="gold"
                  visual={<CrewMark variant="wolf" />}
                />
                <Avatar
                  name="Voltage Union"
                  shape="hex"
                  size="lg"
                  tone="cyan"
                  visual={<CrewMark variant="voltage" />}
                />
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule state="loading">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Loading and fallback</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <div className={styles.avatarRow}>
                <Avatar loading name="Loading player" size="lg" tone="cyan" />
                <Avatar initials="RK" name="Rookie King" size="lg" tone="green" />
                <Avatar name="Missing Crew" shape="hex" size="lg" tone="violet" />
                <Avatar name="Suspended player" size="lg" suspended tone="red" />
              </div>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Member group</h2>
            </PanelModuleHeader>
            <PanelModuleBody>
              <AvatarGroup
                items={groupItems}
                label="Night Ravens active members"
                max={4}
                size="lg"
              />
              <p className={styles.moduleCopy}>
                The group exposes member names to assistive technology while keeping the visual
                stack compact.
              </p>
            </PanelModuleBody>
          </PanelModule>
        </PanelGrid>
      </Panel>

      <Panel aria-labelledby="identity-catalogue" density="spacious" tone="secondary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Reusable identity rows</PanelEyebrow>
            <PanelTitle id="identity-catalogue">Player and Crew Identity</PanelTitle>
            <PanelDescription>
              Long names, compact rows, missing data, rankings and account restrictions.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <div className={styles.identityGrid}>
          <section className={styles.identitySection} aria-labelledby="players-heading">
            <h2 className={styles.sectionTitle} id="players-heading">
              Players
            </h2>

            <div className={styles.identityList}>
              <PlayerIdentity
                avatarVisual={<PlayerMark variant="bolt" />}
                badge={
                  <Badge size="sm" tone="positive">
                    Verified
                  </Badge>
                }
                handle="@jayflex"
                metadata="Night Ravens / Lagos"
                name="Jay Flex"
                presence="online"
                subtitle="Elite Division"
                trailing={<RankBadge rank="4" tier="gold" />}
                verified
              />

              <PlayerIdentity
                avatarTone="cyan"
                avatarVisual={<PlayerMark variant="crown" />}
                handle="@novaking"
                metadata="No Crew"
                name="Nova King With An Intentionally Long Competitive Name"
                presence="away"
                subtitle="Open Division"
                trailing={<RankBadge rank="17" />}
              />

              <PlayerIdentity
                avatarTone="red"
                avatarVisual={<PlayerMark variant="flame" />}
                badge={
                  <Badge size="sm" tone="negative">
                    Suspended
                  </Badge>
                }
                handle="@redstorm"
                name="Red Storm"
                presence="offline"
                suspended
              />

              <PlayerIdentity
                compact
                handle="@rookie"
                name="Rookie King"
                presence="online"
                size="sm"
              />
            </div>
          </section>

          <section className={styles.identitySection} aria-labelledby="crews-heading">
            <h2 className={styles.sectionTitle} id="crews-heading">
              Crews
            </h2>

            <div className={styles.identityList}>
              <CrewIdentity
                badge={
                  <Badge size="sm" tone="special">
                    Elite Crew
                  </Badge>
                }
                emblem={<CrewMark variant="raven" />}
                memberCount={24}
                metadata="Rank #3"
                name="Night Ravens"
                subtitle="Precision division"
                tag="NRV"
                trailing={<RankBadge rank="3" tier="elite" />}
                verified
              />

              <CrewIdentity
                emblem={<CrewMark variant="wolf" />}
                emblemTone="gold"
                memberCount={28}
                metadata="Rank #1"
                name="Iron Wolves"
                subtitle="Elite challenge division"
                tag="IRN"
                trailing={<RankBadge rank="1" tier="gold" />}
              />

              <CrewIdentity
                compact
                emblem={<CrewMark variant="voltage" />}
                emblemTone="cyan"
                name="Voltage Union"
                size="sm"
                tag="VLT"
              />

              <CrewIdentity
                badge={
                  <Badge size="sm" tone="negative">
                    Restricted
                  </Badge>
                }
                name="Archived Crew"
                suspended
                tag="ARC"
              />
            </div>
          </section>
        </div>
      </Panel>
    </main>
  );
}
