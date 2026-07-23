import styles from "./play-command-center.module.css";

type PlaySectionTone = "cyan" | "violet" | "green";

export function PlaySectionHeader({
  className,
  index,
  eyebrow,
  title,
  detail,
  tone,
}: {
  className: string;
  index: string;
  eyebrow: string;
  title: string;
  detail: string;
  tone: PlaySectionTone;
}) {
  return (
    <header className={`${styles.sectionHeader} ${className}`} data-tone={tone}>
      <span className={styles.sectionHeaderIndex} aria-hidden="true">
        {index}
      </span>
      <div className={styles.sectionHeaderCopy}>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <span className={styles.sectionHeaderRail} aria-hidden="true" />
    </header>
  );
}
