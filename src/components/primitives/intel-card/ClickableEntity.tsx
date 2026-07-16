"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { useIntelCard, type IntelEntityType } from "./IntelCardProvider";
import styles from "./ClickableEntity.module.css";

export type ClickableIntelEntityProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  entityType: IntelEntityType;
  entityId: string;
  label?: string;
  children: ReactNode;
};

export function ClickableIntelEntity({
  entityType,
  entityId,
  label,
  children,
  className,
  type = "button",
  ...rest
}: ClickableIntelEntityProps) {
  const { openIntel } = useIntelCard();

  return (
    <button
      {...rest}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
      data-intel-entity={entityType}
      data-intel-id={entityId}
      type={type}
      onClick={(event) => {
        rest.onClick?.(event);
        if (!event.defaultPrevented) {
          openIntel(
            label === undefined
              ? { type: entityType, id: entityId }
              : { type: entityType, id: entityId, label },
          );
        }
      }}
    >
      {children}
    </button>
  );
}
