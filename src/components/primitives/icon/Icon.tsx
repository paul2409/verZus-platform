import { forwardRef, type ReactNode, type SVGProps } from "react";

import { iconDefinitions, type IconName } from "./iconDefinitions";
import styles from "./Icon.module.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export type IconTone =
  "inherit" | "neutral" | "muted" | "primary" | "secondary" | "danger" | "warning";

type IconAccessibility =
  | {
      decorative?: true;
      label?: never;
    }
  | {
      decorative: false;
      label: string;
    };

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "color"> &
  IconAccessibility & {
    name: IconName;
    size?: IconSize;
    tone?: IconTone;
  };

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "md", tone = "inherit", decorative = true, label, className, ...svgProps },
  ref,
) {
  const icons = iconDefinitions as Record<string, ReactNode>;
  const content = icons[name] ?? iconDefinitions["help-circle"];

  return (
    <svg
      {...svgProps}
      ref={ref}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      className={joinClassNames(styles.icon, styles[size], styles[tone], className)}
      data-icon={name}
      data-icon-size={size}
      data-icon-tone={tone}
      fill="none"
      focusable="false"
      role={decorative ? undefined : "img"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {content}
    </svg>
  );
});

Icon.displayName = "Icon";
