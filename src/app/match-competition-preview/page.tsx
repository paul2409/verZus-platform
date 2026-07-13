"use client";

import { useState } from "react";

import { Button } from "@/components/primitives/button";
import {
  Drawer,
  Modal,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@/components/primitives/overlay";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelTitle,
} from "@/components/primitives/panel";
import { CompetitionSummary, competitionPreviewMock } from "@/features/competitions";
import {
  BracketNode,
  CheckInAction,
  CheckInStatus,
  MatchIdentity,
  MatchTimelineStep,
  ResultStatus,
  matchPreviewMock,
} from "@/features/matches";

import styles from "./page.module.css";

export default function MatchCompetitionPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.kicker}>VERZUS Design System · M2 Step 14</p>
        <h1 className={styles.title}>Match and Competition Operations</h1>
        <p className={styles.description}>
          Competition discovery, check-in, participant versus, timelines, brackets and accessible
          overlays.
        </p>
      </header>

      <Panel aria-labelledby="competition-heading" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="competition-heading">Competition primitives</PanelTitle>
            <PanelDescription>
              Visual state only. Registration and authorization remain inside the competition
              domain.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>
        <PanelBody>
          <CompetitionSummary
            actions={
              <>
                <Button onClick={() => setModalOpen(true)}>Enter competition</Button>
                <Popover>
                  <PopoverTrigger>Eligibility details</PopoverTrigger>
                  <PopoverContent>
                    Your verified EA FC account and current division satisfy this event.
                  </PopoverContent>
                </Popover>
              </>
            }
            competition={competitionPreviewMock}
          />
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="match-heading" tone="secondary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="match-heading">Match operations</PanelTitle>
            <PanelDescription>
              Essential actions remain available while unrelated modules fail independently.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>
        <PanelGrid columns={2}>
          <MatchIdentity
            actions={
              <>
                <CheckInAction state="available" />
                <Button onClick={() => setDrawerOpen(true)} variant="secondary">
                  Open operations
                </Button>
              </>
            }
            match={matchPreviewMock}
          />

          <section className={styles.timelinePanel}>
            <div className={styles.inlineHeader}>
              <h3>Match timeline</h3>
              <CheckInStatus state="available" />
            </div>
            <ol className={styles.timeline}>
              <MatchTimelineStep
                detail="Completed at 17:42"
                label="Pairing confirmed"
                state="complete"
              />
              <MatchTimelineStep
                detail="Closes in 12 minutes"
                label="Player check-in"
                state="current"
              />
              <MatchTimelineStep label="Lobby opens" state="future" />
              <MatchTimelineStep label="Submit result" state="future" />
            </ol>
          </section>
        </PanelGrid>
      </Panel>

      <Panel aria-labelledby="bracket-heading" tone="accent">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="bracket-heading">Bracket and result primitives</PanelTitle>
          </PanelHeadingGroup>
        </PanelHeader>
        <PanelBody>
          <div className={styles.bracketRow}>
            <BracketNode
              active
              away={matchPreviewMock.away}
              home={matchPreviewMock.home}
              label="Semi-final A"
            />
            <div className={styles.resultBox}>
              <Tooltip content="Results become final after the dispute window closes.">
                <button className={styles.helpButton} type="button">
                  Result policy
                </button>
              </Tooltip>
              <ResultStatus state="pending" />
            </div>
          </div>
        </PanelBody>
      </Panel>

      <Modal
        description="Review eligibility and confirm your entry."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Confirm entry</Button>
          </>
        }
        onOpenChange={setModalOpen}
        open={modalOpen}
        title="Enter VERZUS Weekly Open"
      >
        <p className={styles.dialogCopy}>
          Entry is server-authorized. This design-system modal does not perform a registration
          request.
        </p>
      </Modal>

      <Drawer
        description="Check-in, lobby and result actions for this match."
        footer={
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            Done
          </Button>
        }
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
        side="right"
        title="Match operations"
      >
        <div className={styles.drawerContent}>
          <CheckInStatus state="available" />
          <CheckInAction fullWidth state="available" />
          <p className={styles.dialogCopy}>
            Navigation remains outside this drawer and survives failures in match operations.
          </p>
        </div>
      </Drawer>
    </main>
  );
}
