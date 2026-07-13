import { Badge, StatusBadge } from "@/components/primitives/badge";
import {
  BottomNavigation,
  BottomNavigationItem,
  NavigationBadge,
} from "@/components/primitives/bottom-navigation";
import { Icon } from "@/components/primitives/icon";
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
  PanelStatus,
  PanelTitle,
} from "@/components/primitives/panel";

import styles from "./page.module.css";

export default function BottomNavigationPreviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <p className={styles.kicker}>VERZUS Design System · M2</p>
        <h1 className={styles.title}>Bottom Navigation</h1>
        <p className={styles.description}>
          Mobile-first route navigation with safe-area support, a prominent Play action,
          notifications, degraded states and navigation that survives unrelated feature failures.
        </p>
      </header>

      <Panel aria-labelledby="navigation-contract-heading" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Navigation contract</PanelEyebrow>
            <PanelTitle id="navigation-contract-heading">Five essential destinations</PanelTitle>
            <PanelDescription>
              The shell owns route selection later in M3. This primitive owns presentation,
              accessibility and resilient states only.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelGrid columns={2}>
          <PanelModule aria-label="Available navigation state" state="success">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Available</h2>
              <PanelStatus tone="positive">Online-safe</PanelStatus>
            </PanelModuleHeader>
            <PanelModuleBody>
              <p className={styles.moduleCopy}>
                Core destinations remain links and preserve browser navigation.
              </p>
            </PanelModuleBody>
          </PanelModule>

          <PanelModule aria-label="Crew feed failure" state="error">
            <PanelModuleHeader>
              <h2 className={styles.moduleTitle}>Crew feed unavailable</h2>
              <PanelStatus tone="negative">Isolated failure</PanelStatus>
            </PanelModuleHeader>
            <PanelModuleBody>
              <p className={styles.moduleCopy}>
                The Crew widget failed, but the primary navigation below remains visible and usable.
              </p>
            </PanelModuleBody>
          </PanelModule>
        </PanelGrid>
      </Panel>

      <section aria-labelledby="static-variants-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Visual variants</p>
            <h2 id="static-variants-heading" className={styles.sectionTitle}>
              Static gallery examples
            </h2>
          </div>
          <StatusBadge status="online">Navigation healthy</StatusBadge>
        </div>

        <div className={styles.variantGrid}>
          <article className={styles.variantCard}>
            <div className={styles.variantHeader}>
              <h3>Elevated</h3>
              <Badge tone="information">4 destinations</Badge>
            </div>
            <BottomNavigation
              items={4}
              label="Elevated preview navigation"
              position="static"
              variant="elevated"
            >
              <BottomNavigationItem
                current
                href="#home"
                icon={<Icon decorative name="home" />}
                label="Home"
              />
              <BottomNavigationItem
                href="#compete"
                icon={<Icon decorative name="trophy" />}
                label="Compete"
              />
              <BottomNavigationItem
                href="#crew"
                icon={<Icon decorative name="users" />}
                label="Crew"
              />
              <BottomNavigationItem
                href="#profile"
                icon={<Icon decorative name="user" />}
                label="Profile"
              />
            </BottomNavigation>
          </article>

          <article className={styles.variantCard}>
            <div className={styles.variantHeader}>
              <h3>Degraded mode</h3>
              <Badge tone="warning">Partial</Badge>
            </div>
            <BottomNavigation
              items={5}
              label="Degraded preview navigation"
              position="static"
              variant="floating"
            >
              <BottomNavigationItem
                href="#home-degraded"
                icon={<Icon decorative name="home" />}
                label="Home"
              />
              <BottomNavigationItem
                href="#compete-degraded"
                icon={<Icon decorative name="trophy" />}
                label="Compete"
              />
              <BottomNavigationItem
                current
                href="#play-degraded"
                icon={<Icon decorative name="play" />}
                label="Play"
                prominent
              />
              <BottomNavigationItem
                href="#crew-degraded"
                icon={<Icon decorative name="users" />}
                label="Crew"
                offlineSafe={false}
                state="partial"
              />
              <BottomNavigationItem
                href="#rewards-degraded"
                icon={<Icon decorative name="gift" />}
                label="Rewards"
                state="disabled"
              />
            </BottomNavigation>
          </article>
        </div>
      </section>

      <div aria-hidden="true" className={styles.fixedNavigationSpacer} />

      <BottomNavigation
        items={5}
        label="Primary preview navigation"
        position="fixed"
        variant="standard"
      >
        <BottomNavigationItem href="#home" icon={<Icon decorative name="home" />} label="Home" />
        <BottomNavigationItem
          href="#compete"
          icon={<Icon decorative name="trophy" />}
          label="Compete"
        />
        <BottomNavigationItem
          current
          href="#play"
          icon={<Icon decorative name="play" />}
          label="Play"
          prominent
        />
        <BottomNavigationItem
          badge={<NavigationBadge count={4} label="4 unread Crew notifications" tone="danger" />}
          href="#crew"
          icon={<Icon decorative name="users" />}
          label="Crew"
        />
        <BottomNavigationItem
          href="#profile"
          icon={<Icon decorative name="user" />}
          label="Profile"
        />
      </BottomNavigation>
    </main>
  );
}
