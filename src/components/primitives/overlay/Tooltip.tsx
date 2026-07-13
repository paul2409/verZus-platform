"use client";

import { cloneElement, isValidElement, useId, type HTMLAttributes, type ReactElement } from "react";

import styles from "./Overlay.module.css";
import { joinClassNames } from "./utils";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export type TooltipProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactElement<Record<string, unknown>>;
  content: string;
  placement?: TooltipPlacement;
};

const placementClasses: Record<TooltipPlacement, string> = {
  top: styles.tooltipTop!,
  right: styles.tooltipRight!,
  bottom: styles.tooltipBottom!,
  left: styles.tooltipLeft!,
};

export function Tooltip({
  children,
  content,
  placement = "top",
  className,
  ...spanProps
}: TooltipProps) {
  const tooltipId = useId();

  if (!isValidElement(children)) {
    return null;
  }

  const describedBy =
    typeof children.props["aria-describedby"] === "string"
      ? `${children.props["aria-describedby"]} ${tooltipId}`
      : tooltipId;

  return (
    <span
      {...spanProps}
      className={joinClassNames(styles.tooltipRoot, className)}
      data-tooltip-placement={placement}
    >
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span
        className={joinClassNames(styles.tooltip, placementClasses[placement])}
        id={tooltipId}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}
