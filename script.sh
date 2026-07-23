#!/usr/bin/env bash
set -euo pipefail

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

REPO="${1:-.}"
cd "$REPO"

printf '\n==> VERZUS Play visual balance pass\n'
printf 'Repository: %s\n' "$(pwd)"
printf 'Borders   : lighter 1px cards / 2px primary panel\n'
printf 'Headers   : richer cyan / violet / green tactical bands\n'

required=(
  "src/features/play/ui/PlayCommandCenter.tsx"
  "src/features/play/ui/PlaySectionHeader.tsx"
  "src/features/play/ui/play-command-center.module.css"
)

for path in "${required[@]}"; do
  if [[ ! -f "$path" ]]; then
    printf 'Missing prerequisite: %s\n' "$path" >&2
    printf 'Apply the Play section-header step before this refinement.\n' >&2
    exit 1
  fi
done

backup_root=".git/verzus-backups/play-color-balance"
timestamp="$(date +%Y%m%d-%H%M%S)"
backup_dir="$backup_root/$timestamp"
mkdir -p "$backup_dir"

paths=(
  "src/features/play/ui/play-command-center.module.css"
)

printf '%s\n' "${paths[@]}" > "$backup_dir/touched-paths.txt"
tar -czf "$backup_dir/files-before-color-balance.tar.gz" "${paths[@]}"

rollback() {
  status=$?
  if [[ $status -eq 0 ]]; then
    return
  fi

  printf '\nPlay visual balance failed. Restoring files from %s\n' "$backup_dir" >&2
  while IFS= read -r path; do
    rm -rf -- "$path"
  done < "$backup_dir/touched-paths.txt"
  tar -xzf "$backup_dir/files-before-color-balance.tar.gz" -C .
  exit "$status"
}
trap rollback EXIT

python -X utf8 - <<'PY'
from pathlib import Path

path = Path("src/features/play/ui/play-command-center.module.css")
text = path.read_text(encoding="utf-8")
start = "/* VERZUS PLAY COLOR BALANCE START */"
end = "/* VERZUS PLAY COLOR BALANCE END */"

if start in text:
    before, rest = text.split(start, 1)
    if end not in rest:
        raise SystemExit("Existing Play color-balance CSS marker is malformed")
    _, after = rest.split(end, 1)
    text = before.rstrip() + "\n" + after.lstrip("\n")

block = r'''
/* VERZUS PLAY COLOR BALANCE START */
.playRoot {
  --play-frame-neutral: #294451;
  --play-frame-bright: #4f7788;
  --play-cyan-soft: #4ce8ff;
  --play-violet-soft: #b884ff;
  --play-magenta-soft: #ff66ca;
  --play-green-soft: #48f5a0;
  --play-amber-soft: #ffc857;
}

/*
 * Separation now comes from spacing, tone and header bands rather than
 * oversized outlines. Standard cards use 1px; only the primary task uses 2px.
 */
.dashboardGrid {
  column-gap: 0.9rem;
  row-gap: 0.72rem;
}

.progressionSectionHeader,
.intelSectionHeader {
  margin-top: 0.45rem;
}

.sectionHeader {
  min-height: 3.35rem;
  isolation: isolate;
  border: 1px solid color-mix(in srgb, var(--section-accent) 48%, var(--play-frame-neutral));
  border-left-width: 4px;
  border-radius: 0.55rem;
  background:
    radial-gradient(circle at 88% 50%, color-mix(in srgb, var(--section-accent) 19%, transparent), transparent 31%),
    linear-gradient(100deg, color-mix(in srgb, var(--section-accent) 14%, #071019), #071018 42%, #03090e 100%);
  box-shadow:
    0 0.7rem 1.6rem rgb(0 0 0 / 20%),
    0 0 1.3rem color-mix(in srgb, var(--section-accent) 10%, transparent),
    inset 0 1px 0 rgb(255 255 255 / 5%);
}

.sectionHeader::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: "";
  opacity: 0.22;
  pointer-events: none;
  background: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 22px,
    color-mix(in srgb, var(--section-accent) 17%, transparent) 23px,
    transparent 24px
  );
  mask-image: linear-gradient(90deg, transparent, #000 38%, #000 100%);
}

.sectionHeader::after {
  position: absolute;
  right: 0.75rem;
  bottom: 0.38rem;
  width: 4.8rem;
  height: 0.18rem;
  border-radius: 999px;
  content: "";
  background: linear-gradient(90deg, transparent, var(--section-accent));
  box-shadow: 0 0 0.85rem color-mix(in srgb, var(--section-accent) 45%, transparent);
}

.sectionHeader[data-tone="cyan"] {
  --section-accent: var(--play-cyan-soft);
}

.sectionHeader[data-tone="violet"] {
  --section-accent: var(--play-violet-soft);
  background:
    radial-gradient(circle at 84% 42%, rgb(255 102 202 / 12%), transparent 30%),
    linear-gradient(100deg, rgb(184 132 255 / 15%), #100d1d 43%, #07070d 100%);
}

.sectionHeader[data-tone="green"] {
  --section-accent: var(--play-green-soft);
  background:
    radial-gradient(circle at 86% 45%, rgb(255 200 87 / 10%), transparent 29%),
    linear-gradient(100deg, rgb(72 245 160 / 14%), #071712 43%, #040b09 100%);
}

.sectionHeaderIndex {
  width: 2.75rem;
  border-right: 1px solid color-mix(in srgb, var(--section-accent) 45%, var(--play-frame-neutral));
  color: #f6fbff;
  background:
    linear-gradient(150deg, color-mix(in srgb, var(--section-accent) 75%, #ffffff), var(--section-accent) 48%, color-mix(in srgb, var(--section-accent) 54%, #001019));
  text-shadow: 0 1px 0 rgb(0 0 0 / 45%);
  box-shadow: inset -1px 0 0 rgb(255 255 255 / 10%);
}

.sectionHeaderCopy {
  column-gap: 0.85rem;
  padding: 0.52rem 0.85rem;
}

.sectionHeaderCopy small {
  color: color-mix(in srgb, var(--section-accent) 88%, white);
  font-size: 0.61rem;
  letter-spacing: 0.14em;
  text-shadow: 0 0 0.75rem color-mix(in srgb, var(--section-accent) 42%, transparent);
}

.sectionHeaderCopy h2 {
  margin-top: 0.16rem;
  color: #f5fbff;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-shadow: 0 0 1rem color-mix(in srgb, var(--section-accent) 19%, transparent);
}

.sectionHeaderCopy p {
  color: #c8d7e0;
  font-size: 0.75rem;
  font-weight: 580;
}

.sectionHeaderRail {
  height: 1px;
  opacity: 0.75;
}

/* Section-specific accents make the screen more colorful without visual noise. */
.matchArea,
.quickArea,
.upNextArea {
  --widget-accent: var(--play-cyan-soft);
}

.modesArea {
  --widget-accent: var(--play-violet-soft);
}

.statsArea {
  --widget-accent: var(--play-magenta-soft);
}

.challengesArea {
  --widget-accent: var(--play-amber-soft);
}

.opportunitiesArea {
  --widget-accent: var(--play-green-soft);
}

.activityArea {
  --widget-accent: var(--play-cyan-soft);
}

.crewArea {
  --widget-accent: var(--play-violet-soft);
}

.widget {
  --play-widget-padding: 0.8rem;
  border-width: 1px !important;
  border-color: color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 31%, var(--play-frame-neutral)) !important;
  border-radius: 0.52rem;
  background:
    linear-gradient(155deg, color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 4%, transparent), transparent 38%),
    linear-gradient(180deg, rgb(9 18 25 / 98%), rgb(4 10 15 / 98%));
  box-shadow:
    0 0.85rem 1.8rem rgb(0 0 0 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 4%),
    inset 0 2px 0 color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 34%, transparent);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

@media (hover: hover) {
  .widget:hover {
    border-color: color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 54%, var(--play-frame-bright)) !important;
    box-shadow:
      0 1rem 2rem rgb(0 0 0 / 22%),
      0 0 1.15rem color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 9%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 5%),
      inset 0 2px 0 color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 48%, transparent);
    transform: translateY(-1px);
  }
}

.nextMatchPanel {
  border-width: 2px !important;
  border-color: color-mix(in srgb, var(--play-cyan-soft) 62%, var(--play-frame-bright)) !important;
  box-shadow:
    0 1rem 2.2rem rgb(0 0 0 / 24%),
    0 0 1.4rem rgb(76 232 255 / 9%),
    inset 0 2px 0 rgb(76 232 255 / 42%);
}

.widgetHeader {
  min-height: 3rem;
  margin-bottom: 0.72rem;
  border-bottom: 1px solid color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 34%, var(--play-frame-neutral));
  background:
    radial-gradient(circle at 94% 50%, color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 10%, transparent), transparent 28%),
    linear-gradient(90deg, color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 9%, transparent), transparent 55%);
}

.widgetHeader::before {
  width: 3px;
  background: var(--widget-accent, var(--play-cyan-soft));
  box-shadow: 0 0 0.8rem color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 48%, transparent);
}

.widgetHeader h2 {
  color: #f2f8fb;
  font-size: 1rem;
  text-shadow: 0 0 0.8rem color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 12%, transparent);
}

.widgetHeader > div > span {
  color: #b8c8d2;
}

.widgetHeader > b,
.widgetHeader > a {
  border-width: 1px;
  border-color: color-mix(in srgb, var(--widget-accent, var(--play-green-soft)) 48%, var(--play-frame-neutral));
  background: color-mix(in srgb, var(--widget-accent, var(--play-green-soft)) 7%, transparent);
  color: color-mix(in srgb, var(--widget-accent, var(--play-green-soft)) 78%, white);
}

.nextMatchCommand > header {
  border-bottom-width: 1px;
  border-bottom-color: color-mix(in srgb, var(--play-cyan-soft) 45%, var(--play-frame-neutral));
  background:
    radial-gradient(circle at 88% 50%, rgb(76 232 255 / 10%), transparent 25%),
    linear-gradient(90deg, rgb(76 232 255 / 9%), transparent 62%);
}

.overviewStrip,
.globalBanner,
.playStatusFooter {
  border-width: 1px !important;
  border-color: var(--play-frame-neutral) !important;
  border-radius: 0.52rem;
}

.globalBanner {
  border-left-width: 4px !important;
  background:
    linear-gradient(90deg, rgb(255 200 87 / 9%), transparent 46%),
    rgb(8 15 20 / 97%);
}

.quickActionList a,
.upNextList article,
.playModeGrid a,
.playModeGrid article,
.activityFeed article,
.crewSignalRows > div,
.opportunityCards article,
.widgetState,
.actionRow,
.stateCard,
.inlineError {
  border-width: 1px !important;
  border-color: color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 24%, var(--play-frame-neutral)) !important;
  border-radius: 0.38rem;
}

.quickActionList a,
.playModeGrid a,
.opportunityCards article {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--widget-accent, var(--play-cyan-soft)) 6%, transparent), transparent 52%),
    rgb(8 16 22 / 88%);
}

.heroSecondaryButton,
.fullWidthLink,
.emptyActions a:not(.heroPrimaryButton) {
  border-width: 1px;
}

@media (max-width: 48rem) {
  .sectionHeader {
    min-height: 3.45rem;
    border-left-width: 3px;
  }

  .sectionHeaderCopy {
    padding: 0.52rem 0.68rem;
  }

  .sectionHeaderCopy h2 {
    font-size: 0.96rem;
  }

  .sectionHeaderCopy p {
    color: #bdccd6;
    font-size: 0.7rem;
  }

  .widget {
    border-radius: 0.48rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .widget {
    transition: none;
  }

  .widget:hover {
    transform: none;
  }
}
/* VERZUS PLAY COLOR BALANCE END */
'''

path.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8", newline="\n")
PY

printf '\n==> Formatting Play stylesheet\n'
./node_modules/.bin/prettier \
  src/features/play/ui/play-command-center.module.css \
  --write

printf '\n==> Running narrow section-header test\n'
./node_modules/.bin/vitest run \
  src/features/play/ui/PlaySectionHeader.test.tsx \
  --pool=threads \
  --maxWorkers=1 \
  --no-file-parallelism \
  --no-isolate

printf '\n==> Verifying balanced-border and color contracts\n'
python -X utf8 - <<'PY'
from pathlib import Path

css = Path("src/features/play/ui/play-command-center.module.css").read_text(encoding="utf-8")
required = [
    "/* VERZUS PLAY COLOR BALANCE START */",
    "border-width: 1px !important",
    "border-width: 2px !important",
    "--widget-accent: var(--play-violet-soft)",
    "--widget-accent: var(--play-magenta-soft)",
    "--widget-accent: var(--play-green-soft)",
    '.sectionHeader[data-tone="cyan"]',
    '.sectionHeader[data-tone="violet"]',
    '.sectionHeader[data-tone="green"]',
]
missing = [token for token in required if token not in css]
if missing:
    raise SystemExit("Missing Play visual-balance contract: " + ", ".join(missing))

print("Balanced borders and colorful section headers verified.")
PY

trap - EXIT
printf '\nVERZUS PLAY VISUAL BALANCE COMPLETE\n'
printf 'Backup: %s\n' "$backup_dir"
