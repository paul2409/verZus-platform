#!/usr/bin/env bash
set -euo pipefail

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

REPO="${1:-.}"
cd "$REPO"

printf '\n==> VERZUS Play interaction pass\n'
printf 'Repository: %s\n' "$(pwd)"
printf 'Scope     : Play section headers, widgets, cards, rows, links and buttons\n'
printf 'Input     : Mouse, keyboard and reduced-motion safe\n\n'

required=(
  "src/features/play/ui/play-command-center.module.css"
  "src/features/play/ui/action-centre-panel.module.css"
  "package.json"
)

for path in "${required[@]}"; do
  if [[ ! -f "$path" ]]; then
    printf 'Missing prerequisite: %s\n' "$path" >&2
    printf 'Apply the Play command-centre and Action Centre steps first.\n' >&2
    exit 1
  fi
done

backup_root=".git/verzus-backups/play-hover-effects"
timestamp="$(date +%Y%m%d-%H%M%S)"
backup_dir="$backup_root/$timestamp"
mkdir -p "$backup_dir"

paths=(
  "src/features/play/ui/play-command-center.module.css"
  "src/features/play/ui/action-centre-panel.module.css"
  "scripts/check-play-interactions.mjs"
  "package.json"
)

printf '%s\n' "${paths[@]}" > "$backup_dir/touched-paths.txt"
existing=()
for path in "${paths[@]}"; do
  if [[ -e "$path" ]]; then
    existing+=("$path")
  fi
done
printf '%s\n' "${existing[@]}" > "$backup_dir/existing-paths.txt"
if (( ${#existing[@]} > 0 )); then
  tar -czf "$backup_dir/files-before-play-hover.tar.gz" "${existing[@]}"
else
  tar -czf "$backup_dir/files-before-play-hover.tar.gz" --files-from /dev/null
fi

rollback() {
  status=$?
  if [[ $status -eq 0 ]]; then
    return
  fi

  printf '\nPlay interaction pass failed. Restoring files from %s\n' "$backup_dir" >&2
  while IFS= read -r path; do
    rm -rf -- "$path"
  done < "$backup_dir/touched-paths.txt"
  tar -xzf "$backup_dir/files-before-play-hover.tar.gz" -C .
  exit "$status"
}
trap rollback EXIT

mkdir -p scripts

python -X utf8 - <<'PY'
from pathlib import Path

path = Path("src/features/play/ui/play-command-center.module.css")
text = path.read_text(encoding="utf-8")
start = "/* VERZUS PLAY INTERACTIONS START */"
end = "/* VERZUS PLAY INTERACTIONS END */"

if start in text:
    before, rest = text.split(start, 1)
    if end not in rest:
        raise SystemExit("Existing Play interaction marker is malformed")
    _, after = rest.split(end, 1)
    text = before.rstrip() + "\n" + after.lstrip("\n")

block = r'''
/* VERZUS PLAY INTERACTIONS START */
.playRoot {
  --play-motion-fast: 140ms;
  --play-motion-normal: 190ms;
  --play-motion-slow: 260ms;
  --play-motion-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --play-focus-ring: var(--play-cyan-soft, var(--play-cyan));
}

/* Consistent motion contract for every major Play surface. */
.sectionHeader,
.widget,
.overviewStrip,
.globalBanner,
.playStatusFooter,
.quickActionList a,
.upNextList a,
.upNextList article,
.playModeGrid a,
.playModeGrid article,
.challengeList > div,
.opportunityCards article,
.activityFeed article,
.crewRosterSummary,
.crewSignalRows > div,
.statsList > div,
.emptySteps > *,
.emptyActivityPreview > *,
.emptyChallengePreview > *,
.emptyOpportunityGrid > *,
.emptyScheduleSlots > *,
.emptyCrewBenefits > *,
.emptyStatsDashboard > *,
.heroPrimaryButton,
.heroSecondaryButton,
.fullWidthLink,
.overviewRefresh,
.globalBanner button,
.widgetHeader > a,
.widgetHeader > button,
.emptyActions a,
.emptyActions button {
  transition:
    color var(--play-motion-fast) var(--play-motion-ease),
    background-color var(--play-motion-fast) var(--play-motion-ease),
    border-color var(--play-motion-fast) var(--play-motion-ease),
    box-shadow var(--play-motion-normal) var(--play-motion-ease),
    opacity var(--play-motion-fast) var(--play-motion-ease),
    transform var(--play-motion-normal) var(--play-motion-ease);
}

.sectionHeaderIndex,
.sectionHeaderRail,
.widgetHeader::before,
.quickActionIcon,
.upNextIcon,
.playModeGrid span,
.opportunityBackdrop,
.opportunityCopy,
.activityFeed article > span,
.crewBadge,
.actionCta {
  transition:
    color var(--play-motion-fast) var(--play-motion-ease),
    background-color var(--play-motion-fast) var(--play-motion-ease),
    border-color var(--play-motion-fast) var(--play-motion-ease),
    box-shadow var(--play-motion-normal) var(--play-motion-ease),
    filter var(--play-motion-normal) var(--play-motion-ease),
    opacity var(--play-motion-fast) var(--play-motion-ease),
    transform var(--play-motion-normal) var(--play-motion-ease);
}

/* Keyboard users receive the same hierarchy as mouse users. */
.playRoot :where(a, button):focus-visible {
  outline: 2px solid var(--play-focus-ring);
  outline-offset: 3px;
  box-shadow:
    0 0 0 1px #031018,
    0 0 0 4px color-mix(in srgb, var(--play-focus-ring) 30%, transparent);
}

.playRoot :where(a, button):active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
}

@media (hover: hover) and (pointer: fine) {
  /* Full-width section headers. */
  .sectionHeader:hover {
    border-color: color-mix(in srgb, var(--section-accent) 72%, white);
    box-shadow:
      0 1rem 2.2rem rgb(0 0 0 / 28%),
      0 0 1.7rem color-mix(in srgb, var(--section-accent) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 8%);
    transform: translateY(-2px);
  }

  .sectionHeader:hover .sectionHeaderIndex {
    box-shadow:
      inset -1px 0 0 rgb(255 255 255 / 18%),
      0 0 1rem color-mix(in srgb, var(--section-accent) 30%, transparent);
    filter: saturate(1.18) brightness(1.08);
    transform: scale(1.035);
  }

  .sectionHeader:hover .sectionHeaderRail {
    filter: brightness(1.3);
    transform: scaleX(1.06);
    transform-origin: right center;
  }

  .sectionHeader:hover .sectionHeaderCopy h2 {
    color: color-mix(in srgb, var(--section-accent) 18%, white);
    text-shadow: 0 0 1rem color-mix(in srgb, var(--section-accent) 28%, transparent);
  }

  /* Every dashboard module has an accent-aware lift. */
  .widget:hover {
    border-color: color-mix(
      in srgb,
      var(--widget-accent, var(--play-cyan-soft, var(--play-cyan))) 62%,
      var(--play-frame-bright, #5b7f8d)
    ) !important;
    box-shadow:
      0 1.15rem 2.35rem rgb(0 0 0 / 28%),
      0 0 1.45rem color-mix(
        in srgb,
        var(--widget-accent, var(--play-cyan-soft, var(--play-cyan))) 15%,
        transparent
      ),
      inset 0 1px 0 rgb(255 255 255 / 7%),
      inset 0 2px 0 color-mix(
        in srgb,
        var(--widget-accent, var(--play-cyan-soft, var(--play-cyan))) 56%,
        transparent
      );
    transform: translateY(-2px);
  }

  .widget:hover .widgetHeader {
    background:
      linear-gradient(
        90deg,
        color-mix(
          in srgb,
          var(--widget-accent, var(--play-cyan-soft, var(--play-cyan))) 13%,
          transparent
        ),
        transparent 62%
      ),
      linear-gradient(180deg, rgb(255 255 255 / 5%), rgb(0 0 0 / 10%));
  }

  .widget:hover .widgetHeader::before {
    box-shadow: 0 0 1rem var(--widget-accent, var(--play-cyan-soft, var(--play-cyan)));
    filter: brightness(1.2);
    transform: scaleY(1.08);
  }

  .widget:hover .widgetHeader h2 {
    color: color-mix(
      in srgb,
      var(--widget-accent, var(--play-cyan-soft, var(--play-cyan))) 16%,
      white
    );
  }

  /* Top information surfaces. */
  .overviewStrip:hover,
  .globalBanner:hover,
  .playStatusFooter:hover {
    border-color: color-mix(in srgb, var(--play-cyan) 42%, var(--play-line)) !important;
    box-shadow:
      0 0.9rem 1.9rem rgb(0 0 0 / 21%),
      0 0 1.1rem rgb(34 223 245 / 8%);
    transform: translateY(-1px);
  }

  .overviewFacts > div:hover,
  .playStatusFooter > div:hover {
    background: rgb(34 223 245 / 5%);
  }

  /* Quick Actions and Up Next options. */
  .quickActionList a:hover,
  .quickActionList a:focus-visible,
  .upNextList a:hover,
  .upNextList a:focus-visible,
  .upNextList article:hover {
    border-color: color-mix(in srgb, var(--play-green) 58%, var(--play-line));
    background:
      linear-gradient(90deg, rgb(0 255 138 / 8%), transparent 72%),
      rgb(255 255 255 / 2%);
    box-shadow:
      0 0.75rem 1.3rem rgb(0 0 0 / 18%),
      inset 3px 0 0 color-mix(in srgb, var(--play-green) 75%, transparent);
    transform: translateX(4px);
  }

  .quickActionList a:hover .quickActionIcon,
  .quickActionList a:focus-visible .quickActionIcon,
  .upNextList a:hover .upNextIcon,
  .upNextList a:focus-visible .upNextIcon,
  .upNextList article:hover .upNextIcon {
    border-color: currentColor;
    box-shadow: 0 0 0.85rem color-mix(in srgb, currentColor 32%, transparent);
    transform: scale(1.08);
  }

  /* Play modes behave like selectable game tiles. */
  .playModeGrid a:hover,
  .playModeGrid a:focus-visible,
  .playModeGrid article:hover {
    background:
      radial-gradient(circle at 50% 80%, color-mix(in srgb, currentColor 14%, transparent), transparent 55%),
      linear-gradient(180deg, color-mix(in srgb, currentColor 11%, transparent), transparent);
    box-shadow:
      0 0.9rem 1.6rem rgb(0 0 0 / 24%),
      0 0 1.15rem color-mix(in srgb, currentColor 14%, transparent),
      inset 0 1px 0 color-mix(in srgb, currentColor 24%, transparent);
    transform: translateY(-4px);
  }

  .playModeGrid a:hover span,
  .playModeGrid a:focus-visible span,
  .playModeGrid article:hover span {
    filter: brightness(1.16) saturate(1.14);
    box-shadow: 0 0 1rem color-mix(in srgb, currentColor 25%, transparent);
    transform: translateY(-2px) scale(1.055);
  }

  /* Stats, challenges and empty-state guidance. */
  .statsList > div:hover,
  .challengeList > div:hover,
  .emptySteps > *:hover,
  .emptyActivityPreview > *:hover,
  .emptyChallengePreview > *:hover,
  .emptyOpportunityGrid > *:hover,
  .emptyScheduleSlots > *:hover,
  .emptyCrewBenefits > *:hover,
  .emptyStatsDashboard > *:hover {
    border-color: color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 42%, var(--play-line));
    background: color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 7%, transparent);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 56%, transparent);
    transform: translateX(3px);
  }

  .statsList > div:hover dd,
  .challengeList > div:hover strong {
    color: color-mix(in srgb, var(--widget-accent, var(--play-green)) 22%, white);
  }

  /* Competition cards. */
  .opportunityCards article:hover {
    border-color: color-mix(in srgb, var(--widget-accent, var(--play-green)) 62%, var(--play-line)) !important;
    box-shadow:
      0 1rem 1.9rem rgb(0 0 0 / 30%),
      0 0 1.25rem color-mix(in srgb, var(--widget-accent, var(--play-green)) 14%, transparent);
    transform: translateY(-4px);
  }

  .opportunityCards article:hover .opportunityBackdrop {
    filter: brightness(1.12) saturate(1.14);
    transform: scale(1.045);
  }

  .opportunityCards article:hover .opportunityCopy {
    transform: translateY(-2px);
  }

  .opportunityCards article > a:hover,
  .opportunityCards article > a:focus-visible {
    color: #00130c;
    border-color: var(--play-green);
    background: var(--play-green);
    box-shadow: 0 0 1rem rgb(0 255 138 / 24%);
    transform: translateY(-1px);
  }

  /* Activity and Crew intelligence rows. */
  .activityFeed article:hover,
  .crewRosterSummary:hover,
  .crewSignalRows > div:hover {
    border-color: color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 44%, var(--play-line));
    background: color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 7%, transparent);
    box-shadow: inset 3px 0 0 color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 56%, transparent);
    transform: translateX(3px);
  }

  .activityFeed article:hover > span,
  .crewRosterSummary:hover .crewBadge {
    box-shadow: 0 0 0.9rem color-mix(in srgb, currentColor 30%, transparent);
    transform: scale(1.08);
  }

  .crewSignalRows > div:hover strong,
  .activityFeed article:hover strong {
    color: color-mix(in srgb, var(--widget-accent, var(--play-cyan)) 18%, white);
  }

  /* Buttons and supporting links. */
  .heroPrimaryButton:hover:not(:disabled),
  .heroPrimaryButton:focus-visible:not(:disabled) {
    filter: brightness(1.08) saturate(1.08);
    box-shadow:
      0 0.75rem 1.35rem rgb(0 0 0 / 22%),
      0 0 1.2rem rgb(0 255 138 / 30%);
    transform: translateY(-2px);
  }

  .heroSecondaryButton:hover:not(:disabled),
  .heroSecondaryButton:focus-visible:not(:disabled),
  .fullWidthLink:hover,
  .fullWidthLink:focus-visible,
  .emptyActions a:hover,
  .emptyActions a:focus-visible,
  .emptyActions button:hover:not(:disabled),
  .emptyActions button:focus-visible:not(:disabled),
  .overviewRefresh:hover:not(:disabled),
  .overviewRefresh:focus-visible:not(:disabled),
  .globalBanner button:hover:not(:disabled),
  .globalBanner button:focus-visible:not(:disabled),
  .widgetHeader > a:hover,
  .widgetHeader > a:focus-visible,
  .widgetHeader > button:hover:not(:disabled),
  .widgetHeader > button:focus-visible:not(:disabled) {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 10%, transparent);
    box-shadow: 0 0 0.95rem color-mix(in srgb, currentColor 17%, transparent);
    transform: translateY(-2px);
  }
}

/* Never leave disabled controls looking interactive. */
.playRoot :where(a, button)[aria-disabled="true"],
.playRoot button:disabled {
  cursor: not-allowed;
  transform: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .playRoot *,
  .playRoot *::before,
  .playRoot *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }

  .sectionHeader:hover,
  .widget:hover,
  .overviewStrip:hover,
  .globalBanner:hover,
  .playStatusFooter:hover,
  .quickActionList a:hover,
  .upNextList a:hover,
  .upNextList article:hover,
  .playModeGrid a:hover,
  .playModeGrid article:hover,
  .challengeList > div:hover,
  .opportunityCards article:hover,
  .activityFeed article:hover,
  .crewRosterSummary:hover,
  .crewSignalRows > div:hover {
    transform: none !important;
  }
}
/* VERZUS PLAY INTERACTIONS END */
'''

path.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8", newline="\n")
PY

python -X utf8 - <<'PY'
from pathlib import Path

path = Path("src/features/play/ui/action-centre-panel.module.css")
text = path.read_text(encoding="utf-8")
start = "/* VERZUS ACTION CENTRE INTERACTIONS START */"
end = "/* VERZUS ACTION CENTRE INTERACTIONS END */"

if start in text:
    before, rest = text.split(start, 1)
    if end not in rest:
        raise SystemExit("Existing Action Centre interaction marker is malformed")
    _, after = rest.split(end, 1)
    text = before.rstrip() + "\n" + after.lstrip("\n")

block = r'''
/* VERZUS ACTION CENTRE INTERACTIONS START */
.panel,
.actionRow,
.stateCard,
.stateCard a,
.stateCard button,
.priorityMark,
.actionCta {
  transition:
    color 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background-color 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 140ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 190ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 190ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.actionRow:focus-visible,
.stateCard a:focus-visible,
.stateCard button:focus-visible {
  outline: 2px solid var(--action-tone, var(--play-cyan, #22dff5));
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .panel:hover {
    border-color: color-mix(in srgb, var(--play-cyan, #22dff5) 46%, var(--play-line, #294451));
    box-shadow:
      0 1.1rem 2.2rem rgb(0 0 0 / 25%),
      0 0 1.2rem rgb(34 223 245 / 9%);
    transform: translateY(-2px);
  }

  .actionRow:hover,
  .actionRow:focus-visible {
    border-color: color-mix(in srgb, var(--action-tone) 66%, var(--play-line, #294451));
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--action-tone) 10%, transparent), transparent 72%),
      rgb(255 255 255 / 2%);
    box-shadow:
      0 0.8rem 1.4rem rgb(0 0 0 / 20%),
      inset 3px 0 0 color-mix(in srgb, var(--action-tone) 76%, transparent);
    transform: translateX(4px);
  }

  .actionRow:hover .priorityMark,
  .actionRow:focus-visible .priorityMark {
    box-shadow: 0 0 0.9rem color-mix(in srgb, var(--action-tone) 35%, transparent);
    filter: brightness(1.15) saturate(1.12);
    transform: scale(1.08);
  }

  .actionRow:hover .actionCta,
  .actionRow:focus-visible .actionCta {
    color: color-mix(in srgb, var(--action-tone) 78%, white);
    transform: translateX(3px);
  }

  .stateCard:hover {
    border-color: color-mix(in srgb, var(--play-cyan, #22dff5) 38%, var(--play-line, #294451));
    box-shadow: inset 3px 0 0 rgb(34 223 245 / 34%);
  }

  .stateCard a:hover,
  .stateCard a:focus-visible,
  .stateCard button:hover:not(:disabled),
  .stateCard button:focus-visible:not(:disabled) {
    border-color: currentColor;
    background: color-mix(in srgb, currentColor 10%, transparent);
    box-shadow: 0 0 0.9rem color-mix(in srgb, currentColor 18%, transparent);
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .actionRow,
  .stateCard,
  .stateCard a,
  .stateCard button,
  .priorityMark,
  .actionCta {
    transition-duration: 0.01ms !important;
  }

  .panel:hover,
  .actionRow:hover,
  .actionRow:focus-visible,
  .stateCard a:hover,
  .stateCard button:hover {
    transform: none !important;
  }
}
/* VERZUS ACTION CENTRE INTERACTIONS END */
'''

path.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8", newline="\n")
PY

cat > scripts/check-play-interactions.mjs <<'JS'
import { readFileSync } from "node:fs";

const playCss = readFileSync(
  "src/features/play/ui/play-command-center.module.css",
  "utf8",
);
const actionCss = readFileSync(
  "src/features/play/ui/action-centre-panel.module.css",
  "utf8",
);

const requiredPlayFragments = [
  "VERZUS PLAY INTERACTIONS START",
  "@media (hover: hover) and (pointer: fine)",
  ".sectionHeader:hover",
  ".widget:hover",
  ".quickActionList a:hover",
  ".playModeGrid a:hover",
  ".opportunityCards article:hover",
  ".activityFeed article:hover",
  ".crewSignalRows > div:hover",
  ":focus-visible",
  "prefers-reduced-motion: reduce",
];

const requiredActionFragments = [
  "VERZUS ACTION CENTRE INTERACTIONS START",
  ".panel:hover",
  ".actionRow:hover",
  ".actionRow:focus-visible",
  ".stateCard a:hover",
  "prefers-reduced-motion: reduce",
];

const missing = [
  ...requiredPlayFragments
    .filter((fragment) => !playCss.includes(fragment))
    .map((fragment) => `Play CSS: ${fragment}`),
  ...requiredActionFragments
    .filter((fragment) => !actionCss.includes(fragment))
    .map((fragment) => `Action Centre CSS: ${fragment}`),
];

if (missing.length > 0) {
  console.error("Play interaction contract failed. Missing:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log("VERZUS Play interaction contract passed.");
JS

python -X utf8 - <<'PY'
import json
from pathlib import Path

path = Path("package.json")
data = json.loads(path.read_text(encoding="utf-8"))
scripts = data.setdefault("scripts", {})
scripts["check:play-interactions"] = "node scripts/check-play-interactions.mjs"
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8", newline="\n")
PY

printf '==> Formatting scoped files\n'
if [[ -x ./node_modules/.bin/prettier ]]; then
  ./node_modules/.bin/prettier --write \
    src/features/play/ui/play-command-center.module.css \
    src/features/play/ui/action-centre-panel.module.css \
    scripts/check-play-interactions.mjs \
    package.json
else
  printf 'Prettier is not installed locally; skipping format step.\n'
fi

printf '\n==> Running Play interaction contract\n'
npm run check:play-interactions

trap - EXIT

printf '\nVERZUS PLAY HOVER EFFECTS COMPLETE\n'
printf 'Sections : accent-aware lift and glow\n'
printf 'Widgets  : border, header and elevation response\n'
printf 'Options  : rows, cards, links and buttons respond\n'
printf 'Keyboard : focus-visible parity included\n'
printf 'Motion   : reduced-motion preference respected\n'
printf 'Backup   : %s\n' "$backup_dir"
