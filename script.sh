#!/usr/bin/env bash
set -euo pipefail

REPO_PATH="${1:-.}"
cd "$REPO_PATH"

CSS_PATH="src/features/play/ui/play-command-center.module.css"

if [[ ! -f "$CSS_PATH" ]]; then
  echo "ERROR: $CSS_PATH was not found." >&2
  exit 1
fi

BACKUP_ROOT=".git/verzus-backups/play-large-type"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp "$CSS_PATH" "$BACKUP_DIR/play-command-center.module.css"

rollback() {
  local status=$?
  if (( status == 0 )); then
    return
  fi

  echo >&2
  echo "Large-type pass failed. Restoring $CSS_PATH" >&2
  cp "$BACKUP_DIR/play-command-center.module.css" "$CSS_PATH"
  exit "$status"
}
trap rollback EXIT

node <<'NODE'
const fs = require("node:fs");

const path = "src/features/play/ui/play-command-center.module.css";
const start = "/* PLAY LARGE TYPE PASS START */";
const end = "/* PLAY LARGE TYPE PASS END */";
let css = fs.readFileSync(path, "utf8");

const block = String.raw`
/* PLAY LARGE TYPE PASS START */
/*
 * Large, high-contrast typography for laptop and desktop Play dashboards.
 * This intentionally overrides the earlier compact-density typography.
 * Decorative space and padding are reduced instead of shrinking readable text.
 */
.playRoot {
  --play-muted: #c8d2dc;
  --play-soft: #aebbc8;
}

.playRoot :where(p, small, span, strong, b, dt, dd, a, button) {
  text-rendering: optimizeLegibility;
}

.playTitleBlock > span {
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.playTitleBlock p {
  color: #d6dee7;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
}

.overviewTrust small,
.overviewFacts dt {
  color: #c6d1dc;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.07em;
}

.overviewTrust strong {
  font-size: 1.4rem;
  line-height: 1;
}

.overviewTrust b {
  font-size: 0.76rem;
  font-weight: 800;
}

.overviewFacts dd {
  font-size: 1.32rem;
  font-weight: 850;
}

.overviewRefresh {
  font-size: 0.74rem;
  font-weight: 800;
}

.globalBanner {
  padding-block: 0.56rem;
}

.globalBanner strong {
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.globalBanner span {
  color: #cbd5df;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.35;
}

.globalBanner button {
  min-height: 2.35rem;
  padding: 0.48rem 0.78rem;
  font-size: 0.74rem;
  font-weight: 900;
}

.widgetHeader h2 {
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.025em;
}

.widgetHeader > div > span {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.07em;
}

.widgetHeader > b,
.widgetHeader > a {
  font-size: 0.74rem;
  font-weight: 850;
  line-height: 1.2;
}

.quickActionList a {
  min-height: 3.15rem;
  padding-block: 0.48rem;
}

.quickActionIcon {
  width: 2.35rem;
  height: 2.35rem;
  font-size: 0.88rem;
}

.quickActionList strong {
  font-family: var(--vz-font-interface);
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.2;
}

.quickActionList small {
  margin-top: 0.16rem;
  color: #bdc9d4;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.28;
}

.emptyContent > small,
.emptyStatsCopy > small {
  color: var(--play-green);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.07em;
}

.emptyContent h3,
.emptyStatsCopy h3 {
  font-size: clamp(1.4rem, 1.8vw, 1.85rem);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: 0.02em;
}

.emptyContent > p,
.emptyStatsCopy > p {
  color: #d0d9e2;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.45;
}

.emptySteps span {
  font-size: 0.68rem;
  font-weight: 900;
}

.emptySteps strong {
  font-family: var(--vz-font-interface);
  font-size: 0.72rem;
  font-weight: 750;
  line-height: 1.32;
}

.emptyActions a,
.heroPrimaryButton,
.heroSecondaryButton {
  min-height: 2.45rem;
  padding: 0.58rem 0.82rem;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.045em;
}

.emptyScheduleSlots b,
.emptyScheduleSlots i {
  font-size: 0.68rem;
  line-height: 1.25;
}

.playModeGrid strong {
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.15;
}

.playModeGrid small {
  color: #c5d0da;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
}

.statsRing span,
.statsRing small,
.emptyStatsRing span,
.emptyStatsRing small {
  font-size: 0.7rem;
  font-weight: 750;
}

.statsList dt,
.emptyStatsCopy dt {
  color: #bdc9d4;
  font-size: 0.69rem;
  font-weight: 800;
}

.statsList dd,
.emptyStatsCopy dd {
  font-size: 0.9rem;
  font-weight: 900;
}

.opportunityCopy > small,
.opportunityCopy > span {
  font-size: 0.68rem;
  font-weight: 850;
}

.opportunityCopy h3 {
  font-size: 1.1rem;
  line-height: 1.1;
}

.opportunityCopy strong {
  font-size: 0.78rem;
  font-weight: 900;
}

.opportunityCopy p {
  color: #c5d0da;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.35;
}

.opportunityCards article > a {
  font-size: 0.72rem;
  font-weight: 900;
}

.activityFeed strong,
.crewRosterSummary strong,
.emptyActivityPreview b,
.emptyCrewBenefits strong,
.emptyOpportunityGrid strong {
  font-family: var(--vz-font-interface);
  font-size: 0.78rem;
  font-weight: 850;
  line-height: 1.25;
}

.activityFeed small,
.crewRosterSummary small,
.crewSignalRows span,
.emptyActivityPreview em,
.emptyOpportunityGrid small {
  color: #becad5;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.3;
}

.activityFeed article > b,
.crewSignalRows strong,
.emptyOpportunityGrid b,
.emptyChallengePreview b,
.emptyCrewBenefits b {
  font-size: 0.68rem;
  font-weight: 850;
}

/*
 * Laptop-height override: keep large text and recover room from decoration,
 * gaps and padding rather than reducing type below readable sizes.
 */
@media (min-width: 76.01rem) and (max-height: 62rem) {
  .playTitleBlock > span {
    font-size: 0.66rem;
  }

  .playTitleBlock p {
    font-size: 0.92rem;
  }

  .overviewTrust small,
  .overviewFacts dt {
    font-size: 0.64rem;
  }

  .overviewTrust strong {
    font-size: 1.22rem;
  }

  .overviewTrust b {
    font-size: 0.7rem;
  }

  .overviewFacts dd {
    font-size: 1.16rem;
  }

  .globalBanner strong,
  .globalBanner span,
  .globalBanner button {
    font-size: 0.7rem;
  }

  .widgetHeader h2 {
    font-size: 0.92rem;
  }

  .widgetHeader > b,
  .widgetHeader > a {
    font-size: 0.68rem;
  }

  .emptyNextMatchPanel .emptyExperience {
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: 0.5rem;
  }

  .emptyNextMatchPanel .emptyVisual {
    min-height: 5.5rem;
  }

  .emptyNextMatchPanel .emptyContent > small {
    font-size: 0.66rem;
  }

  .emptyNextMatchPanel .emptyContent h3 {
    font-size: 1.42rem;
  }

  .emptyNextMatchPanel .emptyContent > p {
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .emptyNextMatchPanel .emptySteps span,
  .emptyNextMatchPanel .emptySteps strong {
    font-size: 0.64rem;
  }

  .emptyNextMatchPanel .emptyActions a {
    font-size: 0.68rem;
  }

  .quickActionList {
    gap: 0.28rem;
  }

  .quickActionList a {
    min-height: 3rem;
    grid-template-columns: 2.2rem minmax(0, 1fr);
    padding-block: 0.38rem;
  }

  .quickActionList strong {
    font-size: 0.76rem;
  }

  .quickActionList small {
    font-size: 0.67rem;
  }

  .upNextWidget .emptyContent > small {
    font-size: 0.64rem;
  }

  .upNextWidget .emptyContent h3 {
    font-size: 1.25rem;
  }

  .upNextWidget .emptyContent > p {
    font-size: 0.73rem;
  }

  .upNextWidget .emptyScheduleSlots b,
  .upNextWidget .emptyScheduleSlots i {
    font-size: 0.62rem;
  }

  .upNextWidget .emptyActions a {
    font-size: 0.66rem;
  }

  .playModeGrid strong {
    font-size: 0.8rem;
  }

  .playModeGrid small {
    font-size: 0.67rem;
  }
}

@media (max-width: 76rem) {
  .widgetHeader h2 {
    font-size: 0.96rem;
  }

  .quickActionList strong,
  .upNextList strong,
  .activityFeed strong,
  .crewRosterSummary strong {
    font-size: 0.8rem;
  }

  .quickActionList small,
  .upNextList b,
  .activityFeed small,
  .crewRosterSummary small,
  .crewSignalRows span {
    font-size: 0.7rem;
  }
}

@media (max-width: 48rem) {
  .playTitleBlock p {
    font-size: 0.94rem;
  }

  .widgetHeader h2 {
    font-size: 1rem;
  }

  .quickActionList strong {
    font-size: 0.84rem;
  }

  .quickActionList small,
  .emptyContent > p,
  .emptyStatsCopy > p {
    font-size: 0.76rem;
  }
}
/* PLAY LARGE TYPE PASS END */`;

const startIndex = css.indexOf(start);
if (startIndex >= 0) {
  const endIndex = css.indexOf(end, startIndex);
  if (endIndex < 0) {
    throw new Error("Existing large-type block is missing its end marker.");
  }
  css = `${css.slice(0, startIndex)}${block}${css.slice(endIndex + end.length)}`;
} else {
  css = `${css.trimEnd()}\n\n${block}\n`;
}

fs.writeFileSync(path, css);
NODE

if ! grep -Fq "/* PLAY LARGE TYPE PASS START */" "$CSS_PATH"; then
  echo "ERROR: Large-type block was not written." >&2
  exit 1
fi

if ! grep -Fq "font-size: 0.82rem;" "$CSS_PATH"; then
  echo "ERROR: Large quick-action typography was not applied." >&2
  exit 1
fi

if ! grep -Fq "font-size: 1.42rem;" "$CSS_PATH"; then
  echo "ERROR: Large laptop empty-state heading was not applied." >&2
  exit 1
fi

trap - EXIT

echo
echo "PLAY FONTS ENLARGED"
echo "Changed: $CSS_PATH"
echo "Backup : $BACKUP_DIR"
echo
echo "Restart the dev server and hard-refresh /play."
