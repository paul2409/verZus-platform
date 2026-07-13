"use client";

import { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Avatar.module.css";
import { getInitials, joinClassNames } from "./utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded" | "hex";
export type AvatarTone = "neutral" | "green" | "cyan" | "violet" | "gold" | "red";
export type AvatarPresence = "none" | "online" | "offline" | "away" | "busy";

export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  name: string;
  src?: string | undefined;
  alt?: string | undefined;
  initials?: string | undefined;
  visual?: ReactNode | undefined;
  size?: AvatarSize;
  shape?: AvatarShape;
  tone?: AvatarTone;
  presence?: AvatarPresence;
  verified?: boolean;
  suspended?: boolean;
  loading?: boolean;
  decorative?: boolean;
};

const sizeClasses = {
  xs: styles.sizeXs!,
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
  xl: styles.sizeXl!,
};

const shapeClasses = {
  circle: styles.shapeCircle!,
  rounded: styles.shapeRounded!,
  hex: styles.shapeHex!,
};

const toneClasses = {
  neutral: styles.toneNeutral!,
  green: styles.toneGreen!,
  cyan: styles.toneCyan!,
  violet: styles.toneViolet!,
  gold: styles.toneGold!,
  red: styles.toneRed!,
};

const presenceClasses = {
  none: styles.presenceNone!,
  online: styles.presenceOnline!,
  offline: styles.presenceOffline!,
  away: styles.presenceAway!,
  busy: styles.presenceBusy!,
};

const presenceLabels: Record<Exclude<AvatarPresence, "none">, string> = {
  online: "online",
  offline: "offline",
  away: "away",
  busy: "busy",
};

function buildAvatarLabel({
  name,
  presence,
  verified,
  suspended,
}: Pick<AvatarProps, "name" | "presence" | "verified" | "suspended">): string {
  const details = [
    verified ? "verified" : null,
    suspended ? "suspended" : null,
    presence && presence !== "none" ? presenceLabels[presence] : null,
  ].filter(Boolean);

  return details.length > 0 ? `${name} avatar, ${details.join(", ")}` : `${name} avatar`;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    src,
    alt,
    initials,
    visual,
    size = "md",
    shape = "circle",
    tone = "neutral",
    presence = "none",
    verified = false,
    suspended = false,
    loading = false,
    decorative = false,
    className,
    "aria-label": ariaLabel,
    ...spanProps
  },
  ref,
) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !imageFailed && !loading;
  const showVisual = Boolean(visual) && !showImage && !loading;
  const showFallback = !showImage && !showVisual && !loading;
  const accessibleLabel = ariaLabel ?? buildAvatarLabel({ name, presence, verified, suspended });

  return (
    <span
      {...spanProps}
      ref={ref}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : accessibleLabel}
      className={joinClassNames(
        styles.avatar,
        sizeClasses[size],
        shapeClasses[shape],
        toneClasses[tone],
        presenceClasses[presence],
        suspended && styles.suspended,
        loading && styles.loading,
        className,
      )}
      data-avatar-loading={loading ? "true" : "false"}
      data-avatar-presence={presence}
      data-avatar-shape={shape}
      data-avatar-size={size}
      data-avatar-suspended={suspended ? "true" : undefined}
      data-avatar-tone={tone}
      data-avatar-verified={verified ? "true" : undefined}
      role={decorative ? undefined : "img"}
      title={decorative ? name : spanProps.title}
    >
      <span aria-hidden="true" className={styles.frame} />

      <span aria-hidden="true" className={styles.content}>
        {showImage ? (
          // A native image is intentional here: Avatar accepts user-hosted and API-provided URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={alt ?? ""}
            className={styles.image}
            onError={() => setImageFailed(true)}
            src={src}
          />
        ) : null}

        {showVisual ? <span className={styles.visual}>{visual}</span> : null}

        {showFallback ? (
          <span className={styles.initials}>{getInitials(name, initials)}</span>
        ) : null}

        {loading ? <span className={styles.loadingLayer} /> : null}
      </span>

      {verified ? (
        <span aria-hidden="true" className={styles.verifiedMark}>
          <svg viewBox="0 0 16 16">
            <path d="m3.2 8.2 2.8 2.7 6.7-6.6" />
          </svg>
        </span>
      ) : null}

      {presence !== "none" ? (
        <span aria-hidden="true" className={styles.presenceIndicator} />
      ) : null}

      {suspended ? <span aria-hidden="true" className={styles.suspendedMark} /> : null}
    </span>
  );
});

Avatar.displayName = "Avatar";
