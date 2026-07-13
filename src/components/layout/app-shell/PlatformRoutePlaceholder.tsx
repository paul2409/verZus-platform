import Link from "next/link";

import { Breadcrumbs } from "./Breadcrumbs";
import { ContentGrid } from "./ContentGrid";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";
import styles from "./PlatformRoute.module.css";
import { getPlatformRouteById, platformRoutes, type PlatformRouteId } from "./platform-route";

export type PlatformRoutePlaceholderProps = {
  routeId: PlatformRouteId;
};

export function PlatformRoutePlaceholder({ routeId }: PlatformRoutePlaceholderProps) {
  const route = getPlatformRouteById(routeId);

  return (
    <PageContainer width="wide">
      <PageHeader
        breadcrumbs={<Breadcrumbs items={route.breadcrumbs} />}
        description={route.description}
        eyebrow={route.eyebrow}
        title={route.title}
      />

      <ContentGrid layout="two">
        <section className={styles.primaryPanel}>
          <p className={styles.panelEyebrow}>M3 route integration</p>
          <h2>Shell connected</h2>
          <p>
            This route now renders inside the production VERZUS application shell. Feature content
            remains intentionally isolated until its milestone is approved.
          </p>
          <dl className={styles.routeFacts}>
            <div>
              <dt>Route</dt>
              <dd>{route.href}</dd>
            </div>
            <div>
              <dt>Section</dt>
              <dd>{route.section}</dd>
            </div>
            <div>
              <dt>Shell dependency</dt>
              <dd>None on feature APIs</dd>
            </div>
          </dl>
        </section>

        <aside className={styles.routeIndex} aria-labelledby={`${route.id}-route-index`}>
          <p className={styles.panelEyebrow}>Primary routes</p>
          <h2 id={`${route.id}-route-index`}>Navigate the shell</h2>
          <ul>
            {platformRoutes.map((item) => (
              <li key={item.id}>
                <Link aria-current={item.id === route.id ? "page" : undefined} href={item.href}>
                  <span>{item.title}</span>
                  <small>{item.section}</small>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </ContentGrid>
    </PageContainer>
  );
}
