import type { HTMLAttributes, ReactNode } from "react";

import styles from "./ButtonGroup.module.css";

export type ButtonGroupOrientation = "horizontal" | "vertical" | "responsive";

export type ButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label: string;
  orientation?: ButtonGroupOrientation;
  fullWidth?: boolean;
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export function ButtonGroup({
  children,
  label,
  orientation = "horizontal",
  fullWidth = false,
  className,
  ...groupProps
}: ButtonGroupProps) {
  return (
    <div
      {...groupProps}
      aria-label={label}
      className={joinClassNames(
        styles.group,
        styles[orientation],
        fullWidth && styles.fullWidth,
        className,
      )}
      data-button-group-orientation={orientation}
      role="group"
    >
      {children}
    </div>
  );
}
