import { Icon } from "@/components/primitives/icon";

import styles from "./CompetitionDiscovery.module.css";

export type CompetitionPaginationProps = {
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
};

export function CompetitionPagination({
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: CompetitionPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Competition result pages" className={styles.pagination}>
      <button
        aria-label="Previous competition page"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <Icon className={styles.previousIcon} decorative name="chevron-right" size="sm" />
        PREVIOUS
      </button>

      <span>
        PAGE <strong>{page}</strong> / {pageCount}
      </span>

      <button
        aria-label="Next competition page"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        NEXT
        <Icon decorative name="chevron-right" size="sm" />
      </button>
    </nav>
  );
}
