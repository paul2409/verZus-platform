import {
  Card,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardMedia,
  CardStat,
  CardStats,
  CardTitle,
  Panel,
  PanelActions,
  PanelDescription,
  PanelEyebrow,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelModule,
  PanelModuleBody,
  PanelModuleHeader,
  PanelStatus,
  PanelTitle,
} from "@/components/primitives/surfaces";

import styles from "./CardPreview.module.css";

type CrewEmblemVariant = "raven" | "voltage" | "wolf";

type CrewCardData = {
  name: string;
  subtitle: string;
  members: string;
  rank: string;
  record: string;
  variant: CrewEmblemVariant;
  tone: "primary" | "secondary" | "accent" | "warning";
  rarity: "rare" | "epic" | "legendary";
  foil: boolean;
};

const crewCards: CrewCardData[] = [
  {
    name: "Night Ravens",
    subtitle: "Precision division",
    members: "24",
    rank: "#03",
    record: "18–4",
    variant: "raven",
    tone: "accent",
    rarity: "epic",
    foil: true,
  },
  {
    name: "Voltage Union",
    subtitle: "High-tempo division",
    members: "19",
    rank: "#07",
    record: "15–6",
    variant: "voltage",
    tone: "secondary",
    rarity: "rare",
    foil: false,
  },
  {
    name: "Iron Wolves",
    subtitle: "Elite challenge division",
    members: "28",
    rank: "#01",
    record: "21–2",
    variant: "wolf",
    tone: "warning",
    rarity: "legendary",
    foil: true,
  },
];

function CrewEmblem({ variant }: { variant: CrewEmblemVariant }) {
  if (variant === "raven") {
    return (
      <svg aria-hidden="true" className={styles.emblem} viewBox="0 0 160 160">
        <path className={styles.emblemBack} d="M80 8 145 45 132 122 80 151 28 122 15 45Z" />

        <path
          className={styles.emblemAccent}
          d="m31 49 42 13 7-30 11 31 40-14-28 33 22 28-35-11-10 35-10-35-35 11 22-28Z"
        />

        <path className={styles.emblemCore} d="m55 70 25-14 25 14-9 37-16 17-16-17Z" />

        <path className={styles.emblemEye} d="m65 79 12 6-14 3Zm30 0-12 6 14 3Z" />
      </svg>
    );
  }

  if (variant === "voltage") {
    return (
      <svg aria-hidden="true" className={styles.emblem} viewBox="0 0 160 160">
        <path className={styles.emblemBack} d="M80 7 143 42 132 122 80 152 28 122 17 42Z" />

        <circle className={styles.emblemRing} cx="80" cy="80" r="48" />

        <path className={styles.emblemAccent} d="M92 22 49 87h27l-8 51 43-67H84Z" />

        <path className={styles.emblemCore} d="m85 49-18 34h18l-6 28 20-35H82Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={styles.emblem} viewBox="0 0 160 160">
      <path className={styles.emblemBack} d="M80 8 145 46 130 125 80 152 30 125 15 46Z" />

      <path className={styles.emblemAccent} d="m38 55 28-23 14 22 14-22 28 23-8 65-34 24-34-24Z" />

      <path className={styles.emblemCore} d="m52 65 28-13 28 13-6 42-22 22-22-22Z" />

      <path className={styles.emblemEye} d="m58 76 18 7-20 5Zm44 0-18 7 20 5Z" />

      <path className={styles.emblemFang} d="m66 105 14 14 14-14-14 7Z" />
    </svg>
  );
}

export default function CardPreviewPage() {
  return (
    <main className={styles.page}>
      <div aria-hidden="true" className={styles.atmosphere} />

      <header className={styles.pageHeader}>
        <p className={styles.kicker}>VERZUS Design System · M2</p>

        <h1 className={styles.pageTitle}>Trading-Card and Panel System</h1>

        <p className={styles.pageDescription}>
          Original collectible Crew cards and mechanical operational panels built on the approved
          VERZUS visual language.
        </p>
      </header>

      <Panel
        aria-labelledby="crew-card-heading"
        density="spacious"
        elevation="floating"
        tone="primary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Collectible identity</PanelEyebrow>

            <PanelTitle id="crew-card-heading">Crew Card Catalogue</PanelTitle>

            <PanelDescription>
              Crew identity cards combine cartoon-styled emblems, metallic framing, rankings,
              records, rarity accents, and optional foil treatment.
            </PanelDescription>
          </PanelHeadingGroup>

          <PanelActions>
            <PanelStatus tone="positive">Foundation approved</PanelStatus>
          </PanelActions>
        </PanelHeader>

        <div className={styles.cardGrid}>
          {crewCards.map((crew) => (
            <Card
              aria-label={`${crew.name} Crew card`}
              className={styles.collectibleCard}
              density="featured"
              foil={crew.foil}
              interactive
              key={crew.name}
              layout="portrait"
              rarity={crew.rarity}
              tone={crew.tone}
            >
              <CardHeader>
                <CardEyebrow>{crew.subtitle}</CardEyebrow>

                <CardTitle as="h3">{crew.name}</CardTitle>
              </CardHeader>

              <CardMedia aspect="square" overlay={<span>Crew identity</span>}>
                <div
                  className={`${styles.emblemStage} ${
                    styles[
                      `emblemStage${crew.variant.charAt(0).toUpperCase()}${crew.variant.slice(1)}`
                    ]
                  }`}
                >
                  <CrewEmblem variant={crew.variant} />
                </div>
              </CardMedia>

              <CardStats>
                <CardStat label="Rank" value={crew.rank} />

                <CardStat label="Record" value={crew.record} />

                <CardStat label="Members" value={crew.members} />
              </CardStats>

              <CardFooter>
                <button className={styles.cardAction} type="button">
                  Inspect Crew
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Panel>

      <Panel
        aria-labelledby="operations-heading"
        density="spacious"
        elevation="raised"
        tone="secondary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Independent operation modules</PanelEyebrow>

            <PanelTitle id="operations-heading">Competition Command Panel</PanelTitle>

            <PanelDescription>
              Each module keeps its own data and failure state. One unavailable service does not
              remove navigation or unrelated actions.
            </PanelDescription>
          </PanelHeadingGroup>

          <PanelActions>
            <button className={styles.secondaryAction} type="button">
              Refresh panel
            </button>
          </PanelActions>
        </PanelHeader>

        <PanelGrid columns={2}>
          <PanelModule aria-label="Next match module" state="success">
            <PanelModuleHeader>
              <div>
                <p className={styles.moduleKicker}>Next match</p>

                <h3 className={styles.moduleTitle}>JAYFLEX vs R3DSTORM</h3>
              </div>

              <PanelStatus tone="positive">Checked in</PanelStatus>
            </PanelModuleHeader>

            <PanelModuleBody>
              <p className={styles.moduleMetric}>Starts in 01:42:18</p>

              <button className={styles.moduleAction} type="button">
                Open match room
              </button>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Ranking module" state="stale">
            <PanelModuleHeader>
              <div>
                <p className={styles.moduleKicker}>Current standing</p>

                <h3 className={styles.moduleTitle}>Division Rank</h3>
              </div>

              <PanelStatus tone="warning">Updating</PanelStatus>
            </PanelModuleHeader>

            <PanelModuleBody>
              <p className={styles.largeRank}>#04</p>

              <p className={styles.moduleCopy}>Last synchronized four minutes ago.</p>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Crew activity module" state="partial-failure">
            <PanelModuleHeader>
              <div>
                <p className={styles.moduleKicker}>Crew activity</p>

                <h3 className={styles.moduleTitle}>Partial Feed Failure</h3>
              </div>

              <PanelStatus tone="negative">Degraded</PanelStatus>
            </PanelModuleHeader>

            <PanelModuleBody>
              <p className={styles.moduleCopy}>
                Member status remains available, but the recent activity feed could not load.
              </p>

              <button className={styles.moduleAction} type="button">
                Retry activity feed
              </button>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Weekly pools module" state="loading">
            <PanelModuleHeader>
              <div>
                <p className={styles.moduleKicker}>Opportunities</p>

                <h3 className={styles.moduleTitle}>Weekly Pools</h3>
              </div>

              <PanelStatus tone="information">Loading</PanelStatus>
            </PanelModuleHeader>

            <PanelModuleBody>
              <div aria-hidden="true" className={styles.skeleton} />

              <div aria-hidden="true" className={styles.skeletonShort} />

              <p className={styles.srOnly}>Loading available weekly pools.</p>
            </PanelModuleBody>
          </PanelModule>
        </PanelGrid>
      </Panel>
    </main>
  );
}
