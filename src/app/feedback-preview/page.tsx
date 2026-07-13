"use client";

import { useState } from "react";

import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import {
  Divider,
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  MaintenanceState,
  NotFoundState,
  OfflineState,
  PartialFailureState,
  RetryAction,
  RetryingState,
  SectionHeader,
  Skeleton,
  SuccessState,
  Toast,
  ToastViewport,
  UnauthorizedState,
} from "@/components/primitives/feedback";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelTitle,
} from "@/components/primitives/panel";

import styles from "./page.module.css";

export default function FeedbackPreviewPage() {
  const [retrying, setRetrying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(true);
  const [showWarningToast, setShowWarningToast] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(true);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>VERZUS Design System · M2 Step 16</p>
        <h1 className={styles.title}>Feedback and System States</h1>
        <p className={styles.description}>
          Resilient loading, empty, failure, offline and confirmation states that can live inside
          cards, panels, routes and independently failing widgets.
        </p>
      </header>

      <Panel aria-labelledby="feedback-heading" density="spacious" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="feedback-heading">Operational states</PanelTitle>
            <PanelDescription>
              Every state is explicit, accessible and isolated from unrelated UI.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <SectionHeader
            action={<Badge tone="positive">11 supported states</Badge>}
            description="Use the base contract or the named wrappers."
            eyebrow="State catalogue"
            title="System-state surfaces"
          />

          <div className={styles.stateGrid}>
            <LoadingState
              description="Preparing the next-match command data."
              size="sm"
              title="Loading match"
            />

            <RetryingState
              action={<RetryAction loading={retrying} onRetry={() => setRetrying(true)} />}
              description="The first request failed. A controlled retry is available."
              size="sm"
              title="Retrying rankings"
            />

            <EmptyState
              description="No open competitions match the current filters."
              size="sm"
              title="No competitions found"
            />

            <ErrorState
              action={<RetryAction onRetry={() => undefined} />}
              description="This widget failed without removing navigation or the next match."
              size="sm"
              title="Crew feed unavailable"
            />

            <OfflineState
              description="Previously loaded data remains visible where safe."
              size="sm"
              title="You are offline"
            />

            <MaintenanceState
              description="Match reporting is temporarily paused for maintenance."
              size="sm"
              title="Scheduled maintenance"
            />

            <UnauthorizedState
              description="Sign in again to continue this protected action."
              size="sm"
              title="Authentication required"
            />

            <ForbiddenState
              description="Your current role cannot approve this result."
              size="sm"
              title="Permission required"
            />

            <NotFoundState
              description="The requested competition may have been removed or archived."
              size="sm"
              title="Competition not found"
            />

            <PartialFailureState
              description="Member presence loaded, but recent Crew activity did not."
              size="sm"
              title="Crew data partially available"
            />

            <SuccessState
              description="The result is stored and queued for opponent confirmation."
              size="sm"
              title="Result submitted"
            />
          </div>
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="skeleton-heading" density="spacious" tone="secondary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="skeleton-heading">Loading skeletons</PanelTitle>
            <PanelDescription>
              Skeletons preserve layout without pretending that data already exists.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <PanelGrid columns={2}>
            <div className={styles.skeletonCard}>
              <div className={styles.identitySkeleton}>
                <Skeleton variant="circle" />
                <div className={styles.skeletonLines}>
                  <Skeleton width="70%" />
                  <Skeleton width="46%" />
                </div>
              </div>
              <Divider />
              <Skeleton height={80} variant="rectangle" />
              <Skeleton variant="control" width="100%" />
            </div>

            <Skeleton label="Loading competition card" variant="card" />
          </PanelGrid>
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="divider-heading" density="spacious" tone="accent">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelTitle id="divider-heading">Section structure</PanelTitle>
            <PanelDescription>
              Domain-neutral headers and dividers keep dense screens legible.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <SectionHeader
            action={<Button variant="secondary">View all</Button>}
            description="Live and scheduled events available to the player."
            eyebrow="Competition discovery"
            size="lg"
            title="Open opportunities"
          />

          <Divider label="Featured competitions" tone="accent" />

          <div className={styles.demoRows}>
            <div>Weekend Knockout Cup</div>
            <Divider orientation="vertical" tone="strong" />
            <div>Registration closes in 02:14:09</div>
          </div>
        </PanelBody>
      </Panel>

      <ToastViewport label="Feedback examples" placement="bottom-right">
        {showSuccessToast ? (
          <Toast
            description="Your match result was saved successfully."
            onDismiss={() => setShowSuccessToast(false)}
            title="Result saved"
            tone="success"
          />
        ) : null}

        {showWarningToast ? (
          <Toast
            description="Rankings are showing cached data from four minutes ago."
            onDismiss={() => setShowWarningToast(false)}
            title="Leaderboard is stale"
            tone="warning"
          />
        ) : null}

        {showErrorToast ? (
          <Toast
            action={
              <button className={styles.toastLink} type="button">
                Open diagnostics
              </button>
            }
            description="Crew activity failed; other modules remain operational."
            onDismiss={() => setShowErrorToast(false)}
            title="Partial service failure"
            tone="error"
          />
        ) : null}
      </ToastViewport>
    </main>
  );
}
