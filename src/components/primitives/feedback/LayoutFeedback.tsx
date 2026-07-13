import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Feedback.module.css";
import { joinClassNames } from "./utils";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerTone = "subtle" | "strong" | "accent";

export type DividerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  orientation?: DividerOrientation;
  tone?: DividerTone;
  label?: ReactNode;
};

export type SectionHeaderSize = "sm" | "md" | "lg";
export type SectionHeaderAlign = "start" | "between";
export type SectionTitleElement = "h2" | "h3" | "h4" | "h5" | "h6";

export type SectionHeaderProps = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: SectionTitleElement;
  size?: SectionHeaderSize;
  align?: SectionHeaderAlign;
};

const dividerOrientationClasses: Record<DividerOrientation, string> = {
  horizontal: styles.dividerHorizontal!,
  vertical: styles.dividerVertical!,
};

const dividerToneClasses: Record<DividerTone, string> = {
  subtle: styles.dividerSubtle!,
  strong: styles.dividerStrong!,
  accent: styles.dividerAccent!,
};

const sectionSizeClasses: Record<SectionHeaderSize, string> = {
  sm: styles.sectionSizeSm!,
  md: styles.sectionSizeMd!,
  lg: styles.sectionSizeLg!,
};

const sectionAlignClasses: Record<SectionHeaderAlign, string> = {
  start: styles.sectionAlignStart!,
  between: styles.sectionAlignBetween!,
};

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", tone = "subtle", label, className, ...dividerProps },
  ref,
) {
  return (
    <div
      {...dividerProps}
      ref={ref}
      aria-orientation={orientation}
      className={joinClassNames(
        styles.divider,
        dividerOrientationClasses[orientation],
        dividerToneClasses[tone],
        Boolean(label) && styles.dividerWithLabel,
        className,
      )}
      data-divider-orientation={orientation}
      data-divider-tone={tone}
      role="separator"
    >
      {label ? <span className={styles.dividerLabel}>{label}</span> : null}
    </div>
  );
});

Divider.displayName = "Divider";

export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(function SectionHeader(
  {
    eyebrow,
    title,
    description,
    action,
    as: Heading = "h2",
    size = "md",
    align = "between",
    className,
    ...headerProps
  },
  ref,
) {
  return (
    <header
      {...headerProps}
      ref={ref}
      className={joinClassNames(
        styles.sectionHeader,
        sectionSizeClasses[size],
        sectionAlignClasses[align],
        className,
      )}
      data-section-header-align={align}
      data-section-header-size={size}
    >
      <div className={styles.sectionCopy}>
        {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
        <Heading className={styles.sectionTitle}>{title}</Heading>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>

      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </header>
  );
});

SectionHeader.displayName = "SectionHeader";
