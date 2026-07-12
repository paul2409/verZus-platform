import { Button, ButtonGroup } from "@/components/primitives/button";

import styles from "./page.module.css";

export default function ButtonPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Button System</p>

          <h1 aria-label="Operational action system" className="vz-display-xl">
            Operational
            <br aria-hidden="true" />
            action system
          </h1>

          <p className="vz-body-md">
            Shared VERZUS actions for check-in, match operations, competitions, rankings, profiles,
            rewards, and administrative workflows.
          </p>
        </header>

        <section aria-labelledby="button-variants" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-variants">
              Approved variants
            </h2>

            <p className="vz-caption">Semantic actions only</p>
          </div>

          <div className={styles.variantGrid}>
            <article className={styles.previewCard}>
              <p className="vz-label-cap">Primary</p>

              <Button leadingIcon="check">Check in now</Button>

              <p className="vz-body-sm">Confirm, continue, play, save, claim.</p>
            </article>

            <article className={styles.previewCard}>
              <p className="vz-label-cap">Secondary</p>

              <Button leadingIcon="credit-card" variant="secondary">
                View card
              </Button>

              <p className="vz-body-sm">Inspect details or open supporting content.</p>
            </article>

            <article className={styles.previewCard}>
              <p className="vz-label-cap">Danger</p>

              <Button leadingIcon="alert-triangle" variant="danger">
                Report issue
              </Button>

              <p className="vz-body-sm">Dispute, remove, revoke, or report.</p>
            </article>

            <article className={styles.previewCard}>
              <p className="vz-label-cap">Ghost</p>

              <Button leadingIcon="x" variant="ghost">
                Dismiss
              </Button>

              <p className="vz-body-sm">Back, close, dismiss, or low-emphasis support.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="button-sizes" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-sizes">
              Sizes
            </h2>

            <p className="vz-caption">44px / 48px / 56px</p>
          </div>

          <div className={styles.buttonRow}>
            <Button leadingIcon="play" size="sm">
              Small
            </Button>

            <Button leadingIcon="play" size="md">
              Default
            </Button>

            <Button leadingIcon="play" size="lg">
              Large
            </Button>
          </div>
        </section>

        <section aria-labelledby="button-icons" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-icons">
              Icon composition
            </h2>

            <p className="vz-caption">Typed registry integration</p>
          </div>

          <div className={styles.buttonRow}>
            <Button leadingIcon="gamepad">Play now</Button>

            <Button trailingIcon="chevron-right" variant="secondary">
              View leaderboard
            </Button>

            <Button leadingIcon="trophy" trailingIcon="chevron-right" variant="secondary">
              Open rankings
            </Button>
          </div>
        </section>

        <section aria-labelledby="button-states" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-states">
              Operational states
            </h2>

            <p className="vz-caption">Default / disabled / loading</p>
          </div>

          <div className={styles.stateGrid}>
            <div>
              <p className="vz-label-cap">Default</p>
              <Button>Queue ranked</Button>
            </div>

            <div>
              <p className="vz-label-cap">Disabled</p>
              <Button disabled>Check-in closed</Button>
            </div>

            <div>
              <p className="vz-label-cap">Loading</p>
              <Button loading loadingLabel="Checking in">
                Check in now
              </Button>
            </div>

            <div>
              <p className="vz-label-cap">Secondary loading</p>
              <Button loading loadingLabel="Opening card" variant="secondary">
                View card
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="button-groups" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-groups">
              Match action group
            </h2>

            <p className="vz-caption">Independent operational actions</p>
          </div>

          <ButtonGroup fullWidth label="Match actions" orientation="responsive">
            <Button leadingIcon="check">Check in</Button>

            <Button leadingIcon="credit-card" variant="secondary">
              Submit result
            </Button>

            <Button leadingIcon="alert-triangle" variant="danger">
              Dispute match
            </Button>
          </ButtonGroup>
        </section>

        <section aria-labelledby="button-mobile" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm" id="button-mobile">
              Full-width action
            </h2>

            <p className="vz-caption">Mobile primary workflow</p>
          </div>

          <Button fullWidth leadingIcon="gamepad" size="lg" trailingIcon="chevron-right">
            Enter competition
          </Button>
        </section>
      </section>
    </main>
  );
}
