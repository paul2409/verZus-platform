import styles from "./AppShell.module.css";

export type RouteProgressProps = {
  active?: boolean;
  label?: string;
};

export function RouteProgress({ active = false, label = "Loading page" }: RouteProgressProps) {
  return (
    <div
      aria-hidden={active ? undefined : true}
      aria-label={active ? label : undefined}
      className={styles.routeProgress}
      data-active={active ? "true" : "false"}
      role={active ? "progressbar" : undefined}
    >
      <span />
    </div>
  );
}
