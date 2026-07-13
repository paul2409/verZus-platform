// VERZUS M3 STEP 3.8

import styles from "./page.module.css";

const previewRoutes = [
  {
    href: "/shell-preview",
    title: "Application shell foundation",
    description: "Responsive top bar, sidebar, bottom navigation and content grid.",
  },
  {
    href: "/navigation-states-preview",
    title: "Navigation states",
    description: "Active, partial, disabled, flagged, loading and error navigation.",
  },
  {
    href: "/route-boundaries-preview",
    title: "Route boundaries",
    description: "Loading, error, missing, offline, maintenance and access states.",
  },
  {
    href: "/widget-boundaries-preview",
    title: "Widget boundaries",
    description: "Independent widget crashes, retries and controlled fallbacks.",
  },
  {
    href: "/shell-overlays-preview",
    title: "Global overlays",
    description: "Search, notifications, profile menu, status banners and route progress.",
  },
  {
    href: "/m3-shell-audit",
    title: "Responsive and failure audit",
    description: "Interactive failure injection and supported-width verification.",
  },
  {
    href: "/play",
    title: "Production shell route",
    description: "The shared application shell integrated with the production route group.",
  },
] as const;

export default function M3PreviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p>M3 Step 3.8</p>
        <h1>Application Shell Approval Centre</h1>
        <p>
          Review the responsive shell, navigation states, route boundaries, widget isolation,
          overlays and production integration before closing Milestone 3.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="m3-preview-routes">
        <h2 id="m3-preview-routes">Review routes</h2>
        <div className={styles.grid}>
          {previewRoutes.map((route) => (
            <a className={styles.card} href={route.href} key={route.href}>
              <strong>{route.title}</strong>
              <span>{route.description}</span>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="m3-approval-widths">
        <h2 id="m3-approval-widths">Required visual widths</h2>
        <p>Approve the shell at every supported width:</p>
        <ul className={styles.checklist}>
          <li>360px mobile</li>
          <li>390px mobile baseline</li>
          <li>430px large mobile</li>
          <li>768px tablet baseline</li>
          <li>1024px laptop</li>
          <li>1440px wide desktop baseline</li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="m3-final-command">
        <h2 id="m3-final-command">Final verification</h2>
        <p>Run the complete M3 gate after approving Storybook and the preview routes.</p>
        <code className={styles.command}>npm run verify:m3</code>
      </section>
    </div>
  );
}
