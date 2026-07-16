import Link from "next/link";

import { Avatar, CrewIdentity, PlayerIdentity } from "@/components/primitives/avatar";
import {
  Badge,
  MovementBadge,
  RankBadge,
  StatValue,
  StatusBadge,
} from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Divider, SectionHeader, Skeleton, SuccessState } from "@/components/primitives/feedback";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelModule,
  PanelModuleBody,
  PanelModuleHeader,
  PanelTitle,
} from "@/components/primitives/panel";
import { SegmentedControl, SegmentedControlItem } from "@/components/primitives/segmented-control";
import { Tab, TabList, TabPanel, Tabs } from "@/components/primitives/tabs";

import { galleryGroups, supportedStates, viewportChecks } from "./gallery-data";
import styles from "./page.module.css";

const colourSwatches = [
  ["green", "Positive / ready"],
  ["cyan", "Information / focus"],
  ["violet", "Special / Crew"],
  ["magenta", "Partial / featured"],
  ["gold", "Rank / warning"],
  ["red", "Danger / failure"],
  ["silver", "Neutral / structure"],
] as const;

export default function DesignSystemPage() {
  const previewCount = galleryGroups.reduce((total, group) => total + group.previews.length, 0);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>11.0 // PLATFORM VISUAL CONTRACT</p>
          <h1 className={styles.title}>VERZUS Competitive UI System</h1>
          <p className={styles.description}>
            One visual audit route for the approved foundation, reusable primitives, responsive
            presentations, competitive modules and failure states built in Steps 1-19.
          </p>
        </div>

        <div aria-label="Milestone summary" className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <strong>19</strong>
            <span>foundation steps represented</span>
          </div>
          <div className={styles.summaryCard}>
            <strong>{previewCount}</strong>
            <span>dedicated preview routes</span>
          </div>
          <div className={styles.summaryCard}>
            <strong>{supportedStates.length}</strong>
            <span>system states documented</span>
          </div>
          <div className={styles.summaryCard}>
            <strong>{viewportChecks.length}</strong>
            <span>required audit widths</span>
          </div>
        </div>
      </header>

      <nav aria-label="Design-system gallery sections" className={styles.sectionNav}>
        <a href="#foundation-sample">Foundation</a>
        <a href="#live-primitives">Live primitives</a>
        {galleryGroups.map((group) => (
          <a href={`#${group.id}`} key={group.id}>
            {group.title}
          </a>
        ))}
        <a href="#state-matrix">State matrix</a>
        <a href="#responsive-audit">Responsive audit</a>
      </nav>

      <Panel
        aria-labelledby="foundation-heading"
        className={styles.galleryPanel}
        density="spacious"
        id="foundation-sample"
        tone="primary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="foundation-heading">Visual foundation</PanelTitle>
            <PanelDescription>
              Approved semantic accents, display typography and dense data treatment.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <div className={styles.foundationGrid}>
            <section aria-labelledby="colour-heading" className={styles.sampleBlock}>
              <h2 id="colour-heading">Semantic accents</h2>
              <div className={styles.swatchGrid}>
                {colourSwatches.map(([tone, label]) => (
                  <div className={styles.swatchItem} key={tone}>
                    <span className={styles.swatch} data-swatch={tone} />
                    <span>
                      <strong>{tone}</strong>
                      <small>{label}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="type-heading" className={styles.sampleBlock}>
              <p className={styles.sampleEyebrow}>Display / Rajdhani</p>
              <h2 className={styles.displaySample} id="type-heading">
                PLAY. RANK. RISE.
              </h2>
              <p className={styles.bodySample}>
                Inter carries interface copy, explanations and operational detail. Data values
                remain bright, compact and immediately scannable.
              </p>
              <div className={styles.dataSamples}>
                <StatValue label="Season rank" tone="warning" value="#04" />
                <StatValue label="Record" tone="positive" value="18-4" />
                <StatValue label="Win rate" suffix="%" tone="information" value="81.8" />
              </div>
            </section>
          </div>
        </PanelBody>
      </Panel>

      <Panel
        aria-labelledby="live-heading"
        className={styles.galleryPanel}
        density="spacious"
        id="live-primitives"
        tone="secondary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="live-heading">Live shared primitives</PanelTitle>
            <PanelDescription>
              Representative shared components rendered together without importing full feature
              domains into the gallery.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <PanelGrid columns={2}>
            <PanelModule state="success">
              <PanelModuleHeader>
                <h2 className={styles.moduleTitle}>Status and ranking</h2>
              </PanelModuleHeader>
              <PanelModuleBody>
                <div className={styles.wrapRow}>
                  <Badge tone="positive">Ready</Badge>
                  <Badge tone="information" variant="outline">
                    Check-in open
                  </Badge>
                  <StatusBadge status="live">Live</StatusBadge>
                  <RankBadge rank={4} tier="gold" />
                  <MovementBadge movement="increased" value={3} />
                </div>
              </PanelModuleBody>
            </PanelModule>

            <PanelModule state="success">
              <PanelModuleHeader>
                <h2 className={styles.moduleTitle}>Player and Crew identity</h2>
              </PanelModuleHeader>
              <PanelModuleBody>
                <div className={styles.identityStack}>
                  <PlayerIdentity
                    avatarTone="green"
                    badge={<Badge tone="positive">Verified</Badge>}
                    handle="@jayflex"
                    metadata="18 wins / 4 losses"
                    name="Jay Flex"
                    presence="online"
                    trailing={<RankBadge rank={4} tier="gold" />}
                    verified
                  />
                  <CrewIdentity
                    badge={<Badge tone="special">Elite Crew</Badge>}
                    emblemTone="violet"
                    memberCount={12}
                    metadata="Crew War ready"
                    name="Night Ravens"
                    tag="NRV"
                    verified
                  />
                </div>
              </PanelModuleBody>
            </PanelModule>

            <PanelModule state="idle">
              <PanelModuleHeader>
                <h2 className={styles.moduleTitle}>Selection controls</h2>
              </PanelModuleHeader>
              <PanelModuleBody>
                <div className={styles.controlStack}>
                  <Tabs defaultValue="overview" size="sm" tone="primary">
                    <TabList>
                      <Tab value="overview">Overview</Tab>
                      <Tab value="matches">Matches</Tab>
                      <Tab value="crew">Crew</Tab>
                    </TabList>
                    <TabPanel value="overview">
                      <p className={styles.controlCopy}>
                        Current competitive overview is selected.
                      </p>
                    </TabPanel>
                    <TabPanel value="matches">
                      <p className={styles.controlCopy}>Match history is selected.</p>
                    </TabPanel>
                    <TabPanel value="crew">
                      <p className={styles.controlCopy}>Crew activity is selected.</p>
                    </TabPanel>
                  </Tabs>

                  <SegmentedControl defaultValue="weekly" fullWidth size="sm">
                    <SegmentedControlItem value="daily">Daily</SegmentedControlItem>
                    <SegmentedControlItem value="weekly">Weekly</SegmentedControlItem>
                    <SegmentedControlItem value="season">Season</SegmentedControlItem>
                  </SegmentedControl>
                </div>
              </PanelModuleBody>
            </PanelModule>

            <PanelModule state="loading">
              <PanelModuleHeader>
                <h2 className={styles.moduleTitle}>Actions and feedback</h2>
              </PanelModuleHeader>
              <PanelModuleBody>
                <div className={styles.feedbackSample}>
                  <div className={styles.wrapRow}>
                    <Button leadingIcon="play" size="sm">
                      Enter match
                    </Button>
                    <Button size="sm" variant="secondary">
                      View bracket
                    </Button>
                  </div>
                  <Divider />
                  <div className={styles.skeletonRow}>
                    <Avatar loading name="Loading player" size="md" />
                    <div>
                      <Skeleton width="9rem" />
                      <Skeleton width="6rem" />
                    </div>
                  </div>
                  <SuccessState
                    compact
                    description="All Step 17 gallery dependencies are available."
                    size="sm"
                    title="Gallery ready"
                  />
                </div>
              </PanelModuleBody>
            </PanelModule>
          </PanelGrid>
        </PanelBody>
      </Panel>

      {galleryGroups.map((group) => (
        <section className={styles.catalogSection} id={group.id} key={group.id}>
          <SectionHeader
            action={<Badge tone="positive">{group.previews.length} previews</Badge>}
            description={group.description}
            eyebrow={group.eyebrow}
            size="lg"
            title={group.title}
          />

          <div className={styles.catalogGrid}>
            {group.previews.map((preview) => (
              <article className={styles.catalogCard} key={preview.href}>
                <div className={styles.catalogCardTop}>
                  <Badge tone="information" variant="outline">
                    Step {preview.step}
                  </Badge>
                  <Badge tone="positive">Ready</Badge>
                </div>
                <div>
                  <h3>{preview.title}</h3>
                  <p>{preview.description}</p>
                </div>
                <ul>
                  {preview.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
                <Link
                  aria-label={`Open ${preview.title} preview`}
                  className={styles.previewLink}
                  href={preview.href}
                >
                  Open preview
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <Panel
        aria-labelledby="state-heading"
        className={styles.galleryPanel}
        density="spacious"
        id="state-matrix"
        tone="accent"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="state-heading">Supported state matrix</PanelTitle>
            <PanelDescription>
              Feature modules select the correct presentational state after schema, adapter, cache
              and view-model processing.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>
        <PanelBody>
          <div className={styles.stateGrid}>
            {supportedStates.map(([state, description]) => (
              <article className={styles.stateCard} key={state}>
                <Badge tone={state === "Error" || state === "Forbidden" ? "negative" : "neutral"}>
                  {state}
                </Badge>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel
        aria-labelledby="responsive-heading"
        className={styles.galleryPanel}
        density="spacious"
        id="responsive-audit"
        tone="primary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="responsive-heading">Responsive approval matrix</PanelTitle>
            <PanelDescription>
              Mobile is a dedicated presentation, not a compressed desktop layout.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>
        <PanelBody>
          <div className={styles.viewportGrid}>
            {viewportChecks.map(([width, purpose]) => (
              <div className={styles.viewportCard} key={width}>
                <strong>{width}</strong>
                <span>{purpose}</span>
              </div>
            ))}
          </div>

          <Divider label="Step 17 approval gate" tone="accent" />

          <div className={styles.approvalGrid}>
            <div>
              <h3>Visual</h3>
              <p>
                Check hierarchy, brightness, texture, focus, wrapping, truncation and contrast at
                every required width.
              </p>
            </div>
            <div>
              <h3>Interaction</h3>
              <p>
                Test keyboard order, touch targets, reduced motion and disabled or loading
                behaviour.
              </p>
            </div>
            <div>
              <h3>Resilience</h3>
              <p>
                Confirm navigation and essential actions survive unrelated widget and feature
                failures.
              </p>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </main>
  );
}
