import { Icon, IconButton, type IconName } from "@/components/primitives/icon";

import styles from "./page.module.css";

const iconNames: readonly IconName[] = [
  "home",
  "gamepad",
  "swords",
  "trophy",
  "shield",
  "crown",
  "users",
  "user",
  "gift",
  "search",
  "bell",
  "more-horizontal",
  "calendar",
  "clock",
  "hourglass",
  "message-square",
  "settings",
  "target",
  "link",
  "credit-card",
  "play",
  "check",
  "x",
  "chevron-down",
  "chevron-right",
  "arrow-up",
  "arrow-down",
  "lock",
  "eye",
  "info",
  "alert-triangle",
  "refresh-cw",
];

export default function IconPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Icon System</p>

          <h1 className="vz-display-xl">Operational iconography</h1>

          <p className="vz-body-md">
            One consistent line system for navigation, matches, rankings, status, search, rewards,
            profiles, and platform operations.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Core icon registry</h2>
            <p className="vz-caption">24 × 24 / 1.75px stroke</p>
          </div>

          <div className={styles.iconGrid}>
            {iconNames.map((name) => (
              <article className={styles.iconCard} key={name}>
                <Icon decorative name={name} size="lg" />
                <span>{name}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Sizes</h2>
            <p className="vz-caption">Token-controlled</p>
          </div>

          <div className={styles.sizeRow}>
            <div>
              <Icon decorative name="trophy" size="xs" />
              <span>XS</span>
            </div>

            <div>
              <Icon decorative name="trophy" size="sm" />
              <span>SM</span>
            </div>

            <div>
              <Icon decorative name="trophy" size="md" />
              <span>MD</span>
            </div>

            <div>
              <Icon decorative name="trophy" size="lg" />
              <span>LG</span>
            </div>

            <div>
              <Icon decorative name="trophy" size="xl" />
              <span>XL</span>
            </div>

            <div>
              <Icon decorative name="trophy" size="xxl" />
              <span>XXL</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Semantic tones</h2>
            <p className="vz-caption">Never colour alone</p>
          </div>

          <div className={styles.toneGrid}>
            <div>
              <Icon
                decorative={false}
                label="Accessible trophy sample"
                name="trophy"
                size="xl"
                tone="neutral"
              />
              <span>Neutral</span>
            </div>

            <div>
              <Icon decorative name="check" size="xl" tone="primary" />
              <span>Primary</span>
            </div>

            <div>
              <Icon decorative name="info" size="xl" tone="secondary" />
              <span>Information</span>
            </div>

            <div>
              <Icon decorative name="alert-triangle" size="xl" tone="warning" />
              <span>Warning</span>
            </div>

            <div>
              <Icon decorative name="x" size="xl" tone="danger" />
              <span>Danger</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Icon buttons</h2>
            <p className="vz-caption">Accessible names required</p>
          </div>

          <div className={styles.buttonRow}>
            <IconButton icon="search" label="Open search" />

            <IconButton icon="bell" label="Open notifications" variant="primary" />

            <IconButton icon="trophy" label="Open leaderboard" variant="secondary" />

            <IconButton icon="alert-triangle" label="Report issue" variant="danger" />

            <IconButton disabled icon="lock" label="Locked action" />

            <IconButton icon="refresh-cw" label="Refresh rankings" loading />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Navigation composition</h2>
            <p className="vz-caption">Visual primitive only</p>
          </div>

          <nav aria-label="Icon system navigation preview" className={styles.navigationPreview}>
            <a className={styles.activeNavigationItem} href="#play">
              <Icon decorative name="gamepad" size="lg" />
              <span>Play</span>
            </a>

            <a href="#compete">
              <Icon decorative name="swords" size="lg" />
              <span>Compete</span>
            </a>

            <a href="#leaderboards">
              <Icon decorative name="trophy" size="lg" />
              <span>Leaderboards</span>
            </a>

            <a href="#crew">
              <Icon decorative name="users" size="lg" />
              <span>Crew</span>
            </a>

            <a href="#rewards">
              <Icon decorative name="gift" size="lg" />
              <span>Rewards</span>
            </a>

            <a href="#profile">
              <Icon decorative name="user" size="lg" />
              <span>Profile</span>
            </a>
          </nav>
        </section>
      </section>
    </main>
  );
}
