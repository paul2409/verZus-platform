import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Panel.module.css";

export type PanelTone = "neutral" | "primary" | "secondary" | "accent" | "warning" | "danger";

export type PanelDensity = "compact" | "regular" | "spacious";

export type PanelElevation = "flat" | "raised" | "floating";

export type PanelLayout = "stack" | "grid" | "split";

export type PanelModuleState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance"
  | "partial-failure";

export type PanelProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  tone?: PanelTone;
  density?: PanelDensity;
  elevation?: PanelElevation;
  layout?: PanelLayout;
  framed?: boolean;
};

export type PanelSectionProps = HTMLAttributes<HTMLElement>;

export type PanelContentProps = HTMLAttributes<HTMLDivElement>;

export type PanelTitleElement = "h2" | "h3" | "h4" | "h5" | "h6";

export type PanelTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: PanelTitleElement;
};

export type PanelDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type PanelGridColumns = 1 | 2 | 3 | 4 | "auto";

export type PanelGridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: PanelGridColumns;
};

export type PanelModuleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  state?: PanelModuleState;
  interactive?: boolean;
  selected?: boolean;
};

export type PanelStatusTone = "neutral" | "positive" | "warning" | "negative" | "information";

export type PanelStatusProps = HTMLAttributes<HTMLDivElement> & {
  tone?: PanelStatusTone;
};

const toneClasses: Record<PanelTone, string> = {
  neutral: styles.toneNeutral,
  primary: styles.tonePrimary,
  secondary: styles.toneSecondary,
  accent: styles.toneAccent,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

const densityClasses: Record<PanelDensity, string> = {
  compact: styles.densityCompact,
  regular: styles.densityRegular,
  spacious: styles.densitySpacious,
};

const elevationClasses: Record<PanelElevation, string> = {
  flat: styles.elevationFlat,
  raised: styles.elevationRaised,
  floating: styles.elevationFloating,
};

const layoutClasses: Record<PanelLayout, string> = {
  stack: styles.layoutStack,
  grid: styles.layoutGrid,
  split: styles.layoutSplit,
};

const gridColumnClasses: Record<PanelGridColumns, string> = {
  1: styles.gridColumnsOne,
  2: styles.gridColumnsTwo,
  3: styles.gridColumnsThree,
  4: styles.gridColumnsFour,
  auto: styles.gridColumnsAuto,
};

const moduleStateClasses: Record<PanelModuleState, string> = {
  idle: styles.moduleStateIdle,
  loading: styles.moduleStateLoading,
  success: styles.moduleStateSuccess,
  empty: styles.moduleStateEmpty,
  stale: styles.moduleStateStale,
  error: styles.moduleStateError,
  offline: styles.moduleStateOffline,
  retrying: styles.moduleStateRetrying,
  unauthorized: styles.moduleStateUnauthorized,
  forbidden: styles.moduleStateForbidden,
  "not-found": styles.moduleStateNotFound,
  maintenance: styles.moduleStateMaintenance,
  "partial-failure": styles.moduleStatePartialFailure,
};

const statusToneClasses: Record<PanelStatusTone, string> = {
  neutral: styles.statusNeutral,
  positive: styles.statusPositive,
  warning: styles.statusWarning,
  negative: styles.statusNegative,
  information: styles.statusInformation,
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function isBusyState(state: PanelModuleState): boolean {
  return state === "loading" || state === "retrying";
}

export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
  {
    children,
    tone = "neutral",
    density = "regular",
    elevation = "raised",
    layout = "stack",
    framed = true,
    className,
    ...sectionProps
  },
  ref,
) {
  return (
    <section
      {...sectionProps}
      ref={ref}
      className={joinClassNames(
        styles.panel,
        toneClasses[tone],
        densityClasses[density],
        elevationClasses[elevation],
        layoutClasses[layout],
        framed && styles.framed,
        className,
      )}
      data-panel-density={density}
      data-panel-elevation={elevation}
      data-panel-framed={framed ? "true" : "false"}
      data-panel-layout={layout}
      data-panel-tone={tone}
    >
      {framed ? (
        <>
          <span aria-hidden="true" className={styles.outerFrame} />

          <span aria-hidden="true" className={styles.innerFrame} />

          <span aria-hidden="true" className={styles.railTop} />

          <span aria-hidden="true" className={styles.railBottom} />

          <span aria-hidden="true" className={styles.cornerTopLeft} />

          <span aria-hidden="true" className={styles.cornerTopRight} />

          <span aria-hidden="true" className={styles.cornerBottomLeft} />

          <span aria-hidden="true" className={styles.cornerBottomRight} />
        </>
      ) : null}

      <div className={styles.panelSurface}>{children}</div>
    </section>
  );
});

Panel.displayName = "Panel";

export function PanelHeader({ className, ...headerProps }: PanelSectionProps) {
  return (
    <header
      {...headerProps}
      className={joinClassNames(styles.header, className)}
      data-panel-slot="header"
    />
  );
}

export function PanelHeadingGroup({ className, ...groupProps }: PanelContentProps) {
  return (
    <div
      {...groupProps}
      className={joinClassNames(styles.headingGroup, className)}
      data-panel-slot="heading-group"
    />
  );
}

export function PanelEyebrow({ className, ...paragraphProps }: PanelDescriptionProps) {
  return (
    <p
      {...paragraphProps}
      className={joinClassNames(styles.eyebrow, className)}
      data-panel-slot="eyebrow"
    />
  );
}

export function PanelTitle({ as: Heading = "h2", className, ...headingProps }: PanelTitleProps) {
  return (
    <Heading
      {...headingProps}
      className={joinClassNames(styles.title, className)}
      data-panel-slot="title"
    />
  );
}

export function PanelDescription({ className, ...descriptionProps }: PanelDescriptionProps) {
  return (
    <p
      {...descriptionProps}
      className={joinClassNames(styles.description, className)}
      data-panel-slot="description"
    />
  );
}

export function PanelActions({ className, ...actionsProps }: PanelContentProps) {
  return (
    <div
      {...actionsProps}
      className={joinClassNames(styles.actions, className)}
      data-panel-slot="actions"
    />
  );
}

export function PanelBody({ className, ...bodyProps }: PanelContentProps) {
  return (
    <div {...bodyProps} className={joinClassNames(styles.body, className)} data-panel-slot="body" />
  );
}

export function PanelGrid({ columns = "auto", className, ...gridProps }: PanelGridProps) {
  return (
    <div
      {...gridProps}
      className={joinClassNames(styles.grid, gridColumnClasses[columns], className)}
      data-panel-columns={String(columns)}
      data-panel-slot="grid"
    />
  );
}

export function PanelModule({
  children,
  state = "idle",
  interactive = false,
  selected = false,
  className,
  ...articleProps
}: PanelModuleProps) {
  const explicitAriaBusy = articleProps["aria-busy"];

  return (
    <article
      {...articleProps}
      aria-busy={explicitAriaBusy ?? (isBusyState(state) ? true : undefined)}
      className={joinClassNames(
        styles.module,
        moduleStateClasses[state],
        interactive && styles.moduleInteractive,
        selected && styles.moduleSelected,
        className,
      )}
      data-panel-module-interactive={interactive ? "true" : undefined}
      data-panel-module-selected={selected ? "true" : undefined}
      data-panel-module-state={state}
      data-panel-slot="module"
    >
      {children}
    </article>
  );
}

export function PanelModuleHeader({ className, ...headerProps }: PanelSectionProps) {
  return (
    <header
      {...headerProps}
      className={joinClassNames(styles.moduleHeader, className)}
      data-panel-slot="module-header"
    />
  );
}

export function PanelModuleBody({ className, ...bodyProps }: PanelContentProps) {
  return (
    <div
      {...bodyProps}
      className={joinClassNames(styles.moduleBody, className)}
      data-panel-slot="module-body"
    />
  );
}

export function PanelStatus({ tone = "neutral", className, ...statusProps }: PanelStatusProps) {
  return (
    <div
      {...statusProps}
      className={joinClassNames(styles.status, statusToneClasses[tone], className)}
      data-panel-status-tone={tone}
      data-panel-slot="status"
      role={statusProps.role ?? "status"}
    />
  );
}

export function PanelFooter({ className, ...footerProps }: PanelSectionProps) {
  return (
    <footer
      {...footerProps}
      className={joinClassNames(styles.footer, className)}
      data-panel-slot="footer"
    />
  );
}
