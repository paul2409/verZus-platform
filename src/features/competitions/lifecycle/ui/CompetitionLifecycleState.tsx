import type {
  CompetitionLifecycleAction,
  CompetitionLifecycleResource,
  CompetitionLifecycleScenario,
} from "../model/competition-lifecycle.types";
import styles from "./CompetitionLifecycleState.module.css";

export type CompetitionLifecycleDisplayError = {
  code: string;
  message: string;
  requestId: string | null;
  retryable: boolean;
};

export type CompetitionLifecycleStateProps = {
  competitionId: string;
  scenario: CompetitionLifecycleScenario;
  resource?: CompetitionLifecycleResource | undefined;
  error?: CompetitionLifecycleDisplayError | undefined;
  isLoading?: boolean | undefined;
  isRetrying?: boolean | undefined;
  onRetry?: (() => void) | undefined;
};

const errorTitle: Record<string, string> = {
  offline: "YOU ARE OFFLINE",
  unauthorized: "SIGN IN REQUIRED",
  forbidden: "ACCESS RESTRICTED",
  not_found: "COMPETITION NOT FOUND",
  maintenance: "COMPETITIONS UNDER MAINTENANCE",
  invalid_response: "LIFECYCLE STATUS UNAVAILABLE",
};

function actionHref(action: CompetitionLifecycleAction, competitionId: string): string | null {
  switch (action) {
    case "view_schedule":
      return "#schedule";
    case "review_eligibility":
      return "#eligibility";
    case "view_waitlist":
      return "#entry";
    case "sign_in":
      return `/login?next=${encodeURIComponent(`/compete/${competitionId}`)}`;
    case "back_to_discovery":
      return "/compete";
    default:
      return null;
  }
}

function actionLabel(action: CompetitionLifecycleAction): string {
  switch (action) {
    case "view_schedule":
      return "VIEW SCHEDULE";
    case "review_eligibility":
      return "REVIEW ELIGIBILITY";
    case "view_waitlist":
      return "VIEW WAITLIST";
    case "sign_in":
      return "SIGN IN";
    case "back_to_discovery":
      return "BACK TO COMPETITIONS";
    case "retry":
      return "RETRY";
    default:
      return "";
  }
}

export function CompetitionLifecycleState({
  competitionId,
  resource,
  error,
  isLoading = false,
  isRetrying = false,
  onRetry,
}: CompetitionLifecycleStateProps) {
  if (!isLoading && !error && resource?.disposition === "entry_open") {
    return null;
  }

  const code = error?.code ?? resource?.disposition ?? "loading";
  const title = isLoading
    ? "CHECKING COMPETITION STATUS"
    : error
      ? (errorTitle[error.code] ?? "COMPETITION STATUS UNAVAILABLE")
      : (resource?.title ?? "COMPETITION STATUS UNAVAILABLE");
  const message = isLoading
    ? "Confirming registration, eligibility, capacity, and service availability."
    : (error?.message ?? resource?.message ?? "Try again.");
  const severity = error
    ? error.code === "forbidden" || error.code === "not_found"
      ? "critical"
      : "warning"
    : (resource?.severity ?? "info");
  const requestId = error?.requestId ?? resource?.meta.requestId ?? null;
  const action = error
    ? error.code === "unauthorized"
      ? "sign_in"
      : error.code === "forbidden" || error.code === "not_found"
        ? "back_to_discovery"
        : error.retryable
          ? "retry"
          : "none"
    : (resource?.primaryAction ?? "none");
  const href = actionHref(action, competitionId);
  const canRetry = action === "retry" && Boolean(onRetry);

  return (
    <section
      aria-busy={isLoading || isRetrying}
      aria-live={severity === "critical" ? "assertive" : "polite"}
      className={styles.state}
      data-blocking={resource?.blocking ? "true" : "false"}
      data-entry-allowed={resource?.entryAllowed ? "true" : "false"}
      data-lifecycle-state={code}
      data-severity={severity}
      role={severity === "critical" ? "alert" : "status"}
    >
      <div className={styles.signal} aria-hidden="true">
        {isLoading || isRetrying ? "…" : "!"}
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>COMPETITION STATUS</span>
        <h2>{title}</h2>
        <p>{message}</p>
        {resource ? (
          <small>
            {resource.registeredCount}/{resource.capacity} REGISTERED
          </small>
        ) : null}
        {requestId ? <small>REFERENCE {requestId}</small> : null}
      </div>
      <div className={styles.actions}>
        {href ? <a href={href}>{actionLabel(action)}</a> : null}
        {canRetry ? (
          <button disabled={isRetrying} onClick={onRetry} type="button">
            {isRetrying ? "RETRYING…" : "RETRY"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
