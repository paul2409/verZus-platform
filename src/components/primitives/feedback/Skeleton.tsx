import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";

import styles from "./Feedback.module.css";
import { joinClassNames } from "./utils";

export type SkeletonVariant = "text" | "circle" | "rectangle" | "control" | "card";
export type SkeletonAnimation = "pulse" | "wave" | "none";

export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  label?: string;
};

const variantClasses: Record<SkeletonVariant, string> = {
  text: styles.skeletonText!,
  circle: styles.skeletonCircle!,
  rectangle: styles.skeletonRectangle!,
  control: styles.skeletonControl!,
  card: styles.skeletonCard!,
};

const animationClasses: Record<SkeletonAnimation, string> = {
  pulse: styles.skeletonPulse!,
  wave: styles.skeletonWave!,
  none: styles.skeletonStatic!,
};

function toDimension(value: string | number | undefined): string | undefined {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = "text", animation = "wave", width, height, label, className, style, ...spanProps },
  ref,
) {
  const widthValue = toDimension(width);
  const heightValue = toDimension(height);
  const dimensionStyle: CSSProperties = {
    ...style,
    ...(widthValue ? { width: widthValue } : {}),
    ...(heightValue ? { height: heightValue } : {}),
  };

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={joinClassNames(
        styles.skeleton,
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      data-skeleton-animation={animation}
      data-skeleton-variant={variant}
      role={label ? "status" : undefined}
      style={dimensionStyle}
    />
  );
});

Skeleton.displayName = "Skeleton";
