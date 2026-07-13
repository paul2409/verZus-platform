import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Badge.module.css";
import { joinClassNames } from "./utils";

export type StatValueTone =
  "neutral" | "positive" | "information" | "warning" | "negative" | "special";

export type StatValueSize = "sm" | "md" | "lg" | "xl";

export type StatValueAlign = "start" | "center" | "end";

export type StatValueProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  tone?: StatValueTone;
  size?: StatValueSize;
  align?: StatValueAlign;
};

const statToneClasses = {
  neutral: styles.statNeutral,
  positive: styles.statPositive,
  information: styles.statInformation,
  warning: styles.statWarning,
  negative: styles.statNegative,
  special: styles.statSpecial,
};

const statSizeClasses = {
  sm: styles.statSizeSm,
  md: styles.statSizeMd,
  lg: styles.statSizeLg,
  xl: styles.statSizeXl,
};

const statAlignClasses = {
  start: styles.statAlignStart,
  center: styles.statAlignCenter,
  end: styles.statAlignEnd,
};

export const StatValue = forwardRef<HTMLDivElement, StatValueProps>(function StatValue(
  {
    label,
    value,
    detail,
    prefix,
    suffix,
    tone = "neutral",
    size = "md",
    align = "start",
    className,
    ...divProps
  },
  ref,
) {
  return (
    <div
      {...divProps}
      ref={ref}
      className={joinClassNames(
        styles.statValue,
        statToneClasses[tone],
        statSizeClasses[size],
        statAlignClasses[align],
        className,
      )}
      data-stat-align={align}
      data-stat-size={size}
      data-stat-tone={tone}
    >
      <span className={styles.statLabel}>{label}</span>

      <span className={styles.statNumber}>
        {prefix ? <span className={styles.statAffix}>{prefix}</span> : null}
        <span>{value}</span>
        {suffix ? <span className={styles.statAffix}>{suffix}</span> : null}
      </span>

      {detail ? <span className={styles.statDetail}>{detail}</span> : null}
    </div>
  );
});

StatValue.displayName = "StatValue";
