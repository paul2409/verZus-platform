import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Card.module.css";

export type CardLayout = "fluid" | "portrait" | "landscape" | "square";

export type CardTone = "neutral" | "primary" | "secondary" | "accent" | "warning" | "danger";

export type CardRarity = "common" | "rare" | "epic" | "legendary";

export type CardDensity = "compact" | "regular" | "featured";

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  layout?: CardLayout;
  tone?: CardTone;
  rarity?: CardRarity;
  density?: CardDensity;
  foil?: boolean;
  interactive?: boolean;
  selected?: boolean;
};

export type CardSectionProps = HTMLAttributes<HTMLElement>;

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export type CardTitleElement = "h2" | "h3" | "h4" | "h5" | "h6";

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: CardTitleElement;
};

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type CardMediaAspect = "auto" | "portrait" | "landscape" | "square";

export type CardMediaProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  aspect?: CardMediaAspect;
  overlay?: ReactNode;
};

export type CardStatsProps = HTMLAttributes<HTMLDListElement>;

export type CardStatProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
};

const layoutClasses = {
  fluid: styles.layoutFluid,
  portrait: styles.layoutPortrait,
  landscape: styles.layoutLandscape,
  square: styles.layoutSquare,
};

const toneClasses = {
  neutral: styles.toneNeutral,
  primary: styles.tonePrimary,
  secondary: styles.toneSecondary,
  accent: styles.toneAccent,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
};

const rarityClasses = {
  common: styles.rarityCommon,
  rare: styles.rarityRare,
  epic: styles.rarityEpic,
  legendary: styles.rarityLegendary,
};

const densityClasses = {
  compact: styles.densityCompact,
  regular: styles.densityRegular,
  featured: styles.densityFeatured,
};

const mediaAspectClasses = {
  auto: styles.mediaAuto,
  portrait: styles.mediaPortrait,
  landscape: styles.mediaLandscape,
  square: styles.mediaSquare,
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    children,
    layout = "fluid",
    tone = "neutral",
    rarity = "common",
    density = "regular",
    foil = false,
    interactive = false,
    selected = false,
    className,
    ...articleProps
  },
  ref,
) {
  return (
    <article
      {...articleProps}
      ref={ref}
      className={joinClassNames(
        styles.card,
        layoutClasses[layout],
        toneClasses[tone],
        rarityClasses[rarity],
        densityClasses[density],
        foil && styles.foil,
        interactive && styles.interactive,
        selected && styles.selected,
        className,
      )}
      data-card-density={density}
      data-card-foil={foil ? "true" : undefined}
      data-card-interactive={interactive ? "true" : undefined}
      data-card-layout={layout}
      data-card-rarity={rarity}
      data-card-selected={selected ? "true" : undefined}
      data-card-tone={tone}
    >
      <span aria-hidden="true" className={styles.outerFrame} />

      <span aria-hidden="true" className={styles.innerFrame} />

      <span aria-hidden="true" className={styles.cornerTopLeft} />

      <span aria-hidden="true" className={styles.cornerTopRight} />

      <span aria-hidden="true" className={styles.cornerBottomLeft} />

      <span aria-hidden="true" className={styles.cornerBottomRight} />

      {foil ? <span aria-hidden="true" className={styles.foilLayer} /> : null}

      <div className={styles.cardSurface}>{children}</div>
    </article>
  );
});

Card.displayName = "Card";

export function CardHeader({ className, ...headerProps }: CardSectionProps) {
  return (
    <header
      {...headerProps}
      className={joinClassNames(styles.header, className)}
      data-card-slot="header"
    />
  );
}

export function CardEyebrow({ className, ...paragraphProps }: CardDescriptionProps) {
  return (
    <p
      {...paragraphProps}
      className={joinClassNames(styles.eyebrow, className)}
      data-card-slot="eyebrow"
    />
  );
}

export function CardTitle({ as: Heading = "h3", className, ...headingProps }: CardTitleProps) {
  return (
    <Heading
      {...headingProps}
      className={joinClassNames(styles.title, className)}
      data-card-slot="title"
    />
  );
}

export function CardDescription({ className, ...descriptionProps }: CardDescriptionProps) {
  return (
    <p
      {...descriptionProps}
      className={joinClassNames(styles.description, className)}
      data-card-slot="description"
    />
  );
}

export function CardMedia({
  children,
  aspect = "auto",
  overlay,
  className,
  ...mediaProps
}: CardMediaProps) {
  return (
    <figure
      {...mediaProps}
      className={joinClassNames(styles.media, mediaAspectClasses[aspect], className)}
      data-card-media-aspect={aspect}
      data-card-slot="media"
    >
      <div className={styles.mediaContent}>{children}</div>

      {overlay ? <figcaption className={styles.mediaOverlay}>{overlay}</figcaption> : null}
    </figure>
  );
}

export function CardBody({ className, ...bodyProps }: CardContentProps) {
  return (
    <div {...bodyProps} className={joinClassNames(styles.body, className)} data-card-slot="body" />
  );
}

export function CardStats({ className, ...statsProps }: CardStatsProps) {
  return (
    <dl
      {...statsProps}
      className={joinClassNames(styles.stats, className)}
      data-card-slot="stats"
    />
  );
}

export function CardStat({ label, value, detail, className, ...statProps }: CardStatProps) {
  return (
    <div {...statProps} className={joinClassNames(styles.stat, className)} data-card-slot="stat">
      <dt className={styles.statLabel}>{label}</dt>

      <dd className={styles.statValue}>{value}</dd>

      {detail ? <dd className={styles.statDetail}>{detail}</dd> : null}
    </div>
  );
}

export function CardFooter({ className, ...footerProps }: CardSectionProps) {
  return (
    <footer
      {...footerProps}
      className={joinClassNames(styles.footer, className)}
      data-card-slot="footer"
    />
  );
}
