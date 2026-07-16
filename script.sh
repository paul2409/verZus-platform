#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-all}"
APPROVAL="${VERZUS_RETRO_SYSTEM_APPROVED:-}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR=".verzus-backups/retro-system/${STAMP}"
THEME_FILE="src/styles/verzus-retro-system.css"
ROOT_LAYOUT="src/app/layout.tsx"
GLOBAL_CSS="src/styles/globals.css"
VERIFY_SCRIPT="scripts/verify-retro-ui.mjs"
DESIGN_DOC="docs/design-system/approved-retro-competitive-theme.md"

FILES=(
  "$ROOT_LAYOUT"
  "$GLOBAL_CSS"
  "src/components/layout/app-shell/AppShell.module.css"
  "src/components/layout/app-shell/PlatformRoute.module.css"
  "src/components/layout/app-shell/ShellOverlays.module.css"
  "src/components/layout/route-boundary/RouteBoundary.module.css"
  "src/components/layout/widget-boundary/WidgetBoundary.module.css"
  "src/components/primitives/avatar/Avatar.module.css"
  "src/components/primitives/badge/Badge.module.css"
  "src/components/primitives/bottom-navigation/BottomNavigation.module.css"
  "src/components/primitives/button/Button.module.css"
  "src/components/primitives/card/Card.module.css"
  "src/components/primitives/checkbox/Checkbox.module.css"
  "src/components/primitives/feedback/Feedback.module.css"
  "src/components/primitives/form-field/FormField.module.css"
  "src/components/primitives/input/Input.module.css"
  "src/components/primitives/intel-card/IntelCard.module.css"
  "src/components/primitives/overlay/Overlay.module.css"
  "src/components/primitives/panel/Panel.module.css"
  "src/components/primitives/radio/Radio.module.css"
  "src/components/primitives/segmented-control/SegmentedControl.module.css"
  "src/components/primitives/select/Select.module.css"
  "src/components/primitives/switch/Switch.module.css"
  "src/components/primitives/tabs/Tabs.module.css"
  "src/components/primitives/textarea/Textarea.module.css"
  "src/features/auth/forms/AuthForms.module.css"
  "src/features/auth/ui/AuthScreens.module.css"
  "src/features/competitions/components/CompetitionPrimitives.module.css"
  "src/features/crews/intel-card/CrewIntelCard.module.css"
  "src/features/leaderboards/components/Leaderboard.module.css"
  "src/features/matches/components/MatchPrimitives.module.css"
  "src/features/matches/intel-card/MatchIntelCard.module.css"
  "src/features/onboarding/ui/onboarding-experience.module.css"
  "src/features/play/ui/play-command-center.module.css"
  "src/features/profiles/intel-card/PlayerIntelCard.module.css"
  ".prettierignore"
  ".gitignore"
  "eslint.config.mjs"
  "package.json"
)

print_plan() {
  cat <<'EOF'
KEEP
  - All routes, feature boundaries, APIs, schemas, adapters, mocks and tests
  - M4 authentication and onboarding behaviour
  - M5 Play state contracts, check-in idempotency and widget failure isolation
  - Existing responsive structure and accessibility semantics
  - Existing feature ownership

REUSE
  - Rajdhani display typography and Inter body typography
  - Existing shared primitives and shell
  - Existing leaderboard, match, competition and Intel components
  - Existing mobile bottom navigation

REPLACE
  - Whole-platform colour tokens through a final theme layer
  - Shared shell, cards, panels, forms, buttons, tabs, badges and overlays
  - Auth, onboarding, Play, leaderboard, match, competition and Intel visual treatment
  - Flat SaaS styling with clipped retro-competitive HUD framing

DELETE
  - No production routes
  - No data contracts
  - No feature logic
  - No tests

CREATE
  - src/styles/verzus-retro-system.css
  - docs/design-system/approved-retro-competitive-theme.md
  - scripts/verify-retro-ui.mjs
  - Timestamped rollback backup
EOF
}

require_repo() {
  local required=("package.json" "$ROOT_LAYOUT" "$GLOBAL_CSS" "src/styles/tokens.css")
  for file in "${required[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "Error: required file not found: $file"
      echo "Run this script from the VERZUS repository root."
      exit 1
    fi
  done

  for file in "${FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "Error: expected current-repository file not found: $file"
      exit 1
    fi
  done
}

require_approval() {
  if [[ "$APPROVAL" != "APPROVED" ]]; then
    cat <<'EOF'
The full-platform visual conversion is approval-gated.

Run:
  VERZUS_RETRO_SYSTEM_APPROVED=APPROVED bash ./VERZUS_Apply_Whole_Platform_Retro_System.sh all
EOF
    exit 2
  fi
}

backup_files() {
  mkdir -p "$BACKUP_DIR"
  for file in "${FILES[@]}"; do
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
  done

  for file in "$THEME_FILE" "$VERIFY_SCRIPT" "$DESIGN_DOC"; do
    if [[ -f "$file" ]]; then
      mkdir -p "$BACKUP_DIR/$(dirname "$file")"
      cp "$file" "$BACKUP_DIR/$file"
    fi
  done

  printf '%s\n' "$BACKUP_DIR" > .verzus-backups/retro-system/LATEST
  echo "Rollback backup: $BACKUP_DIR"
}

append_block() {
  local file="$1"
  local marker="$2"
  local temp
  temp="$(mktemp)"
  cat > "$temp"

  node - "$file" "$marker" "$temp" <<'NODE'
const fs = require("node:fs");
const [file, marker, temp] = process.argv.slice(2);
const start = `/* VERZUS ${marker} START */`;
const end = `/* VERZUS ${marker} END */`;
let source = fs.readFileSync(file, "utf8");
const block = fs.readFileSync(temp, "utf8").trim();
const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\n?`, "g");
source = source.replace(pattern, "").trimEnd();
source += `\n\n${start}\n${block}\n${end}\n`;
fs.writeFileSync(file, source, "utf8");
NODE

  rm -f "$temp"
}

add_exact_line() {
  local file="$1"
  local line="$2"
  touch "$file"
  if ! grep -Fqx "$line" "$file"; then
    printf '\n%s\n' "$line" >> "$file"
  fi
}

write_theme() {
  mkdir -p "$(dirname "$THEME_FILE")"
  cat > "$THEME_FILE" <<'CSS'
/* VERZUS approved retro-competitive visual system.
   Reference: mobile Rankings, crew emblem selector and M2 language board. */

:root,
html[data-theme="retro-competitive"] {
  color-scheme: dark;

  --vz-retro-black: #020305;
  --vz-retro-black-soft: #06070b;
  --vz-retro-surface: #090a10;
  --vz-retro-surface-2: #0e1018;
  --vz-retro-surface-3: #131620;
  --vz-retro-line: #2b2540;
  --vz-retro-line-soft: rgb(137 105 255 / 22%);
  --vz-retro-green: #00ff87;
  --vz-retro-green-bright: #49ffad;
  --vz-retro-cyan: #00e5ff;
  --vz-retro-purple: #9b62ff;
  --vz-retro-blue: #4a9eff;
  --vz-retro-orange: #ff8a1f;
  --vz-retro-gold: #ffc247;
  --vz-retro-red: #ff3b30;
  --vz-retro-pink: #ff2d87;
  --vz-retro-white: #f7f8fb;
  --vz-retro-muted: #8f91a5;

  --vz-color-background-deep: var(--vz-retro-black);
  --vz-color-background: var(--vz-retro-black);
  --vz-color-background-elevated: var(--vz-retro-black-soft);
  --vz-color-background-muted: var(--vz-retro-surface);
  --vz-color-surface-base: var(--vz-retro-surface);
  --vz-color-surface-elevated: var(--vz-retro-surface-2);
  --vz-color-surface-interactive: var(--vz-retro-surface-3);
  --vz-color-panel: rgb(7 8 13 / 96%);
  --vz-color-panel-muted: rgb(12 13 20 / 92%);
  --vz-color-panel-hover: rgb(17 20 29 / 98%);
  --vz-color-panel-active: rgb(0 255 135 / 8%);

  --vz-color-text-primary: var(--vz-retro-white);
  --vz-color-text-secondary: #aaa8bd;
  --vz-color-text-tertiary: var(--vz-retro-muted);
  --vz-color-text-muted: #666879;
  --vz-color-text-brand: var(--vz-retro-green);
  --vz-color-text-link: var(--vz-retro-cyan);

  --vz-color-action-primary: var(--vz-retro-green);
  --vz-color-action-primary-hover: var(--vz-retro-green-bright);
  --vz-color-action-primary-active: #00d970;
  --vz-color-action-secondary: var(--vz-retro-cyan);
  --vz-color-action-secondary-hover: #70f2ff;
  --vz-color-success: var(--vz-retro-green);
  --vz-color-info: var(--vz-retro-cyan);
  --vz-color-warning: var(--vz-retro-gold);
  --vz-color-danger: var(--vz-retro-red);
  --vz-color-status-live: var(--vz-retro-red);

  --vz-color-border-subtle: rgb(155 98 255 / 16%);
  --vz-color-border-default: #29243c;
  --vz-color-border-strong: #41365d;
  --vz-color-border-active: var(--vz-retro-green);
  --vz-color-border-information: var(--vz-retro-cyan);
  --vz-color-border-warning: var(--vz-retro-gold);
  --vz-color-border-danger: var(--vz-retro-red);
  --vz-color-focus-ring: var(--vz-retro-green);
  --vz-color-focus-ring-secondary: var(--vz-retro-cyan);

  --vz-gradient-brand: linear-gradient(90deg, var(--vz-retro-cyan), var(--vz-retro-purple));
  --vz-gradient-brand-horizontal: linear-gradient(90deg, var(--vz-retro-cyan), var(--vz-retro-purple));
  --vz-gradient-primary: linear-gradient(180deg, var(--vz-retro-green-bright), var(--vz-retro-green));

  --vz-radius-xs: 0;
  --vz-radius-sm: 0;
  --vz-radius-md: 0;
  --vz-radius-lg: 0;
  --vz-radius-xl: 0;

  --vz-shadow-focus: 0 0 0 2px rgb(0 255 135 / 24%), 0 0 24px rgb(0 255 135 / 18%);
  --vz-shadow-glow-green: 0 0 18px rgb(0 255 135 / 18%);
  --vz-shadow-glow-cyan: 0 0 18px rgb(0 229 255 / 16%);
  --vz-shadow-glow-purple: 0 0 18px rgb(155 98 255 / 16%);
  --vz-shadow-glow-gold: 0 0 18px rgb(255 194 71 / 16%);

  --vz-retro-cut-sm: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  --vz-retro-cut-md: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
  --vz-retro-cut-lg: polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px);
}

html[data-theme="retro-competitive"] {
  min-width: 320px;
  background: var(--vz-retro-black);
}

html[data-theme="retro-competitive"] body {
  min-height: 100vh;
  color: var(--vz-retro-white);
  background:
    linear-gradient(rgb(2 3 5 / 88%), rgb(2 3 5 / 96%)),
    radial-gradient(circle at 15% 10%, rgb(0 229 255 / 10%), transparent 26rem),
    radial-gradient(circle at 82% 18%, rgb(155 98 255 / 9%), transparent 28rem),
    radial-gradient(circle at 50% 100%, rgb(0 255 135 / 6%), transparent 34rem),
    #020305;
  background-attachment: fixed;
}

html[data-theme="retro-competitive"] body::before,
html[data-theme="retro-competitive"] body::after {
  position: fixed;
  z-index: 9999;
  inset: 0;
  pointer-events: none;
  content: "";
}

html[data-theme="retro-competitive"] body::before {
  opacity: 0.22;
  background-image:
    linear-gradient(rgb(0 229 255 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(155 98 255 / 4%) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
}

html[data-theme="retro-competitive"] body::after {
  opacity: 0.12;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgb(255 255 255 / 7%) 4px
  );
  mix-blend-mode: soft-light;
}

html[data-theme="retro-competitive"] h1,
html[data-theme="retro-competitive"] h2,
html[data-theme="retro-competitive"] h3,
html[data-theme="retro-competitive"] h4,
html[data-theme="retro-competitive"] [data-font-role="display"] {
  font-family: var(--vz-font-display);
  font-weight: 700;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

html[data-theme="retro-competitive"] button,
html[data-theme="retro-competitive"] input,
html[data-theme="retro-competitive"] select,
html[data-theme="retro-competitive"] textarea {
  font-family: var(--vz-font-body);
}

html[data-theme="retro-competitive"] ::selection {
  color: #020305;
  background: var(--vz-retro-green);
}

html[data-theme="retro-competitive"] :focus-visible {
  outline: 2px solid var(--vz-retro-green);
  outline-offset: 3px;
}

html[data-theme="retro-competitive"] table {
  border-collapse: separate;
  border-spacing: 0;
  font-variant-numeric: tabular-nums lining-nums;
}

html[data-theme="retro-competitive"] th {
  color: #a7a3bd;
  font-family: var(--vz-font-display);
  font-size: 0.72rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

html[data-theme="retro-competitive"] hr {
  border: 0;
  border-top: 1px solid var(--vz-retro-line);
}

@media (prefers-reduced-motion: reduce) {
  html[data-theme="retro-competitive"] *,
  html[data-theme="retro-competitive"] *::before,
  html[data-theme="retro-competitive"] *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
CSS
}

patch_root_layout() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/app/layout.tsx";
let source = fs.readFileSync(file, "utf8");
const themeImport = 'import "@/styles/verzus-retro-system.css";';
if (!source.includes(themeImport)) {
  source = source.replace('import "@/styles/globals.css";', 'import "@/styles/globals.css";\nimport "@/styles/verzus-retro-system.css";');
}
source = source.replace('<html lang="en">', '<html lang="en" data-theme="retro-competitive">');
fs.writeFileSync(file, source, "utf8");
NODE
}

write_overrides() {
append_block "src/components/layout/app-shell/AppShell.module.css" "RETRO_SHELL" <<'CSS'
.shell {
  background: transparent;
}

.shell::before {
  opacity: 0.34;
  background:
    linear-gradient(90deg, transparent 0 49%, rgb(0 229 255 / 4%) 50%, transparent 51%),
    linear-gradient(rgb(155 98 255 / 3%) 1px, transparent 1px);
  background-size: 64px 64px, 24px 24px;
}

.topBar,
.sidebar,
.globalStatus,
.globalStatusCompact,
.pageHeader {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(10 11 17 / 98%), rgb(4 5 8 / 98%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 3%);
}

.topBar {
  border-bottom: 1px solid rgb(155 98 255 / 32%);
}

.sidebar {
  border-right: 1px solid rgb(155 98 255 / 30%);
}

.brandGlyph {
  color: var(--vz-retro-green);
  border-color: var(--vz-retro-green);
  background: rgb(0 255 135 / 8%);
  box-shadow: var(--vz-shadow-glow-green);
  clip-path: var(--vz-retro-cut-sm);
}

.brandWord {
  color: transparent;
  background: linear-gradient(90deg, var(--vz-retro-cyan), #ffffff 46%, var(--vz-retro-purple));
  background-clip: text;
  -webkit-background-clip: text;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.navigationLink {
  min-height: 2.85rem;
  border: 1px solid transparent;
  color: #9b98ad;
  clip-path: var(--vz-retro-cut-sm);
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease, transform 150ms ease;
}

.navigationLink:hover {
  color: var(--vz-retro-white);
  border-color: rgb(0 229 255 / 34%);
  background: rgb(0 229 255 / 6%);
  transform: translateX(2px);
}

.navigationLink[aria-current="page"],
.navigationLink[data-navigation-current="true"] {
  color: var(--vz-retro-green);
  border-color: rgb(0 255 135 / 66%);
  background: linear-gradient(90deg, rgb(0 255 135 / 15%), rgb(0 255 135 / 3%));
  box-shadow: inset 3px 0 0 var(--vz-retro-green), var(--vz-shadow-glow-green);
}

.navigationIcon {
  color: currentColor;
}

.pageEyebrow {
  color: var(--vz-retro-purple);
  letter-spacing: 0.18em;
}

.pageHeader h1 {
  letter-spacing: 0.08em;
}

.pageContainer,
.main {
  position: relative;
}

.globalStatus[data-shell-status="operational"],
.sidebarStatus[data-shell-status="operational"] {
  color: var(--vz-retro-green);
}

.routeProgress span {
  background: linear-gradient(90deg, var(--vz-retro-green), var(--vz-retro-cyan), var(--vz-retro-purple));
}

@media (max-width: 767px) {
  .topBar {
    background: rgb(3 4 7 / 96%);
    backdrop-filter: blur(16px);
  }
}
CSS

append_block "src/components/primitives/button/Button.module.css" "RETRO_BUTTONS" <<'CSS'
.button {
  border-width: 1px;
  clip-path: var(--vz-retro-cut-sm);
  font-family: var(--vz-font-display);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.button::before {
  background: linear-gradient(110deg, transparent 18%, rgb(255 255 255 / 18%) 48%, transparent 72%);
  transform: translateX(-130%);
}

.button:hover:not(:disabled)::before {
  transform: translateX(130%);
  transition: transform 420ms ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.primary {
  color: #020305;
  border-color: var(--vz-retro-green);
  background: var(--vz-retro-green);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 22%), var(--vz-shadow-glow-green);
}

.secondary {
  color: var(--vz-retro-cyan);
  border-color: rgb(0 229 255 / 62%);
  background: rgb(0 229 255 / 5%);
}

.accent {
  color: var(--vz-retro-purple);
  border-color: rgb(155 98 255 / 64%);
  background: rgb(155 98 255 / 6%);
}

.danger {
  color: var(--vz-retro-red);
  border-color: rgb(255 59 48 / 64%);
  background: rgb(255 59 48 / 6%);
}

.ghost {
  color: #a7a4ba;
}
CSS

append_block "src/components/primitives/card/Card.module.css" "RETRO_CARDS" <<'CSS'
.cardSurface {
  border: 1px solid var(--vz-retro-line);
  background:
    linear-gradient(145deg, rgb(255 255 255 / 2%), transparent 32%),
    linear-gradient(180deg, rgb(13 15 22 / 98%), rgb(5 6 10 / 98%));
  clip-path: var(--vz-retro-cut-md);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 3%);
}

.outerFrame {
  border-color: rgb(155 98 255 / 26%);
  clip-path: var(--vz-retro-cut-md);
}

.innerFrame {
  border-color: rgb(0 229 255 / 8%);
  clip-path: var(--vz-retro-cut-md);
}

.interactive:hover {
  transform: translateY(-2px);
}

.interactive:hover .outerFrame {
  border-color: rgb(0 229 255 / 55%);
  box-shadow: var(--vz-shadow-glow-cyan);
}

.selected .outerFrame {
  border-color: var(--vz-retro-green);
  box-shadow: var(--vz-shadow-glow-green);
}

.tonePrimary .outerFrame { border-color: rgb(0 255 135 / 58%); }
.toneSecondary .outerFrame { border-color: rgb(0 229 255 / 58%); }
.toneAccent .outerFrame { border-color: rgb(155 98 255 / 58%); }
.toneWarning .outerFrame { border-color: rgb(255 194 71 / 58%); }
.toneDanger .outerFrame { border-color: rgb(255 59 48 / 58%); }

.title,
.eyebrow {
  font-family: var(--vz-font-display);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
CSS

append_block "src/components/primitives/panel/Panel.module.css" "RETRO_PANELS" <<'CSS'
.panelSurface,
.module {
  border-color: var(--vz-retro-line);
  background:
    linear-gradient(135deg, rgb(0 255 135 / 2%), transparent 34%),
    linear-gradient(180deg, rgb(11 13 19 / 98%), rgb(5 6 10 / 98%));
  clip-path: var(--vz-retro-cut-md);
}

.outerFrame,
.innerFrame {
  clip-path: var(--vz-retro-cut-md);
}

.tonePrimary .outerFrame { border-color: rgb(0 255 135 / 48%); }
.toneSecondary .outerFrame { border-color: rgb(0 229 255 / 48%); }
.toneAccent .outerFrame { border-color: rgb(155 98 255 / 48%); }
.toneWarning .outerFrame { border-color: rgb(255 194 71 / 48%); }
.toneDanger .outerFrame { border-color: rgb(255 59 48 / 48%); }

.moduleInteractive:hover {
  border-color: rgb(0 229 255 / 54%);
  background: rgb(0 229 255 / 5%);
  transform: translateY(-1px);
}

.moduleSelected {
  border-color: var(--vz-retro-green);
  background: rgb(0 255 135 / 7%);
  box-shadow: var(--vz-shadow-glow-green);
}

.title,
.eyebrow,
.moduleHeader {
  font-family: var(--vz-font-display);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
CSS

append_block "src/components/primitives/input/Input.module.css" "RETRO_INPUT" <<'CSS'
.root {
  border-color: var(--vz-retro-line);
  background: rgb(4 5 9 / 94%);
  clip-path: var(--vz-retro-cut-sm);
}

.root:hover:not(.disabled):not(.readOnly) {
  border-color: rgb(0 229 255 / 46%);
}

.root:focus-within:not(.disabled) {
  border-color: var(--vz-retro-green);
  box-shadow: var(--vz-shadow-focus);
}

.input {
  color: var(--vz-retro-white);
}
CSS

append_block "src/components/primitives/select/Select.module.css" "RETRO_SELECT" <<'CSS'
.root {
  border-color: var(--vz-retro-line);
  background: rgb(4 5 9 / 94%);
  clip-path: var(--vz-retro-cut-sm);
}
.root:hover:not(.disabled) { border-color: rgb(0 229 255 / 46%); }
.root:focus-within:not(.disabled) { border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-focus); }
.select { color: var(--vz-retro-white); }
CSS

append_block "src/components/primitives/textarea/Textarea.module.css" "RETRO_TEXTAREA" <<'CSS'
.root {
  border-color: var(--vz-retro-line);
  background: rgb(4 5 9 / 94%);
  clip-path: var(--vz-retro-cut-sm);
}
.root:focus-within:not(.disabled) { border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-focus); }
.textarea { color: var(--vz-retro-white); }
CSS

append_block "src/components/primitives/form-field/FormField.module.css" "RETRO_FORM_FIELD" <<'CSS'
.label,
.legend {
  color: #b5b2c6;
  font-family: var(--vz-font-display);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.description { color: var(--vz-retro-muted); }
.error { color: var(--vz-retro-red); }
CSS

append_block "src/components/primitives/checkbox/Checkbox.module.css" "RETRO_CHECKBOX" <<'CSS'
.box {
  border-color: var(--vz-retro-line);
  background: #050609;
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
}
.input:checked + .box {
  border-color: var(--vz-retro-green);
  background: var(--vz-retro-green);
  box-shadow: var(--vz-shadow-glow-green);
}
.label { font-family: var(--vz-font-display); letter-spacing: 0.04em; }
CSS

append_block "src/components/primitives/radio/Radio.module.css" "RETRO_RADIO" <<'CSS'
.indicator {
  border-color: var(--vz-retro-line);
  background: #050609;
}
.input:checked + .indicator {
  border-color: var(--vz-retro-green);
  box-shadow: 0 0 0 3px rgb(0 255 135 / 12%), var(--vz-shadow-glow-green);
}
.label { font-family: var(--vz-font-display); letter-spacing: 0.04em; }
CSS

append_block "src/components/primitives/switch/Switch.module.css" "RETRO_SWITCH" <<'CSS'
.track {
  border-color: var(--vz-retro-line);
  background: #050609;
  clip-path: var(--vz-retro-cut-sm);
}
.input:checked + .track {
  border-color: var(--vz-retro-green);
  background: rgb(0 255 135 / 18%);
  box-shadow: var(--vz-shadow-glow-green);
}
.thumb { background: #a7a4b8; }
.input:checked + .track .thumb { background: var(--vz-retro-green); }
CSS

append_block "src/components/primitives/segmented-control/SegmentedControl.module.css" "RETRO_SEGMENTED" <<'CSS'
.root {
  border: 1px solid var(--vz-retro-line);
  background: #050609;
  clip-path: var(--vz-retro-cut-sm);
}
.item {
  color: #9693aa;
  font-family: var(--vz-font-display);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.item:hover:not(:disabled) { color: var(--vz-retro-cyan); background: rgb(0 229 255 / 5%); }
.selected { color: #020305; background: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); }
CSS

append_block "src/components/primitives/tabs/Tabs.module.css" "RETRO_TABS" <<'CSS'
.list {
  border: 1px solid var(--vz-retro-line);
  background: #050609;
  clip-path: var(--vz-retro-cut-sm);
}
.tab {
  color: #9693aa;
  font-family: var(--vz-font-display);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tab:hover:not(:disabled) { color: var(--vz-retro-cyan); background: rgb(0 229 255 / 5%); }
.selected { color: var(--vz-retro-green); background: rgb(0 255 135 / 8%); }
.selected::after { background: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); }
CSS

append_block "src/components/primitives/badge/Badge.module.css" "RETRO_BADGES" <<'CSS'
.badge,
.rankBadge,
.movementBadge {
  border-width: 1px;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  font-family: var(--vz-font-display);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tonePositive { color: var(--vz-retro-green); border-color: rgb(0 255 135 / 48%); background: rgb(0 255 135 / 7%); }
.toneInformation { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 48%); background: rgb(0 229 255 / 7%); }
.toneSpecial { color: var(--vz-retro-purple); border-color: rgb(155 98 255 / 48%); background: rgb(155 98 255 / 7%); }
.toneWarning { color: var(--vz-retro-gold); border-color: rgb(255 194 71 / 48%); background: rgb(255 194 71 / 7%); }
.toneNegative,
.toneLive { color: var(--vz-retro-red); border-color: rgb(255 59 48 / 48%); background: rgb(255 59 48 / 7%); }
.rankGold { color: var(--vz-retro-gold); box-shadow: var(--vz-shadow-glow-gold); }
.rankElite { color: var(--vz-retro-purple); box-shadow: var(--vz-shadow-glow-purple); }
CSS

append_block "src/components/primitives/avatar/Avatar.module.css" "RETRO_AVATARS" <<'CSS'
.avatar {
  filter: drop-shadow(0 0 8px rgb(0 229 255 / 14%));
}
.frame {
  border-width: 1px;
  background: linear-gradient(135deg, var(--vz-retro-green), var(--vz-retro-cyan), var(--vz-retro-purple));
}
.content { background: #07080d; }
.toneGreen .frame { background: var(--vz-retro-green); }
.toneCyan .frame { background: var(--vz-retro-cyan); }
.toneViolet .frame { background: var(--vz-retro-purple); }
.toneGold .frame { background: var(--vz-retro-gold); }
.toneRed .frame { background: var(--vz-retro-red); }
.presenceOnline .presenceIndicator { background: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); }
CSS

append_block "src/components/primitives/bottom-navigation/BottomNavigation.module.css" "RETRO_BOTTOM_NAV" <<'CSS'
.surface {
  border-color: rgb(155 98 255 / 32%);
  background: rgb(3 4 7 / 96%);
  backdrop-filter: blur(18px);
}
.action {
  color: #8f8ca2;
  font-family: var(--vz-font-display);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.action:hover { color: var(--vz-retro-cyan); }
.current .action { color: var(--vz-retro-green); background: rgb(0 255 135 / 7%); }
.current .activeRail { background: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); }
.prominent .iconWrap { border-color: var(--vz-retro-green); background: rgb(0 255 135 / 14%); box-shadow: var(--vz-shadow-glow-green); }
CSS

append_block "src/components/primitives/overlay/Overlay.module.css" "RETRO_OVERLAY" <<'CSS'
.backdrop { background: rgb(0 0 0 / 82%); backdrop-filter: blur(10px); }
.dialog,
.drawer,
.popoverContent,
.tooltip {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(13 15 22 / 99%), rgb(4 5 8 / 99%));
  clip-path: var(--vz-retro-cut-md);
  box-shadow: 0 24px 80px rgb(0 0 0 / 62%), var(--vz-shadow-glow-purple);
}
.dialogTitle { font-family: var(--vz-font-display); letter-spacing: 0.08em; text-transform: uppercase; }
.dialogClose { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 34%); }
CSS

append_block "src/components/primitives/feedback/Feedback.module.css" "RETRO_FEEDBACK" <<'CSS'
.toast,
.state,
.skeleton,
.banner {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-sm);
}
CSS

append_block "src/components/layout/route-boundary/RouteBoundary.module.css" "RETRO_ROUTE_BOUNDARY" <<'CSS'
.root {
  border: 1px solid var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-lg);
}
.eyebrow { color: var(--vz-retro-purple); }
.marker { color: var(--vz-retro-green); border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); }
.action { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); }
.secondaryAction { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 54%); }
CSS

append_block "src/components/layout/widget-boundary/WidgetBoundary.module.css" "RETRO_WIDGET_BOUNDARY" <<'CSS'
.fallback {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
.marker { color: var(--vz-retro-orange); border-color: rgb(255 138 31 / 54%); }
.action { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); }
.secondaryAction { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 54%); }
CSS

append_block "src/features/leaderboards/components/Leaderboard.module.css" "RETRO_LEADERBOARD" <<'CSS'
.responsiveRoot,
.tableViewport,
.mobileCard,
.stateCard {
  border-color: var(--vz-retro-line);
  background: rgb(5 6 10 / 96%);
  clip-path: var(--vz-retro-cut-md);
}
.tableHead { background: #11121a; }
.headerCell { color: #9895ad; letter-spacing: 0.1em; }
.row { background: rgb(7 8 12 / 92%); border-bottom-color: #22202f; }
.row:nth-child(even) { background: rgb(11 12 18 / 92%); }
.row:hover { background: rgb(0 229 255 / 5%); box-shadow: inset 3px 0 0 var(--vz-retro-cyan); }
.currentRow,
.mobileCurrentCard { background: rgb(0 255 135 / 7%); box-shadow: inset 4px 0 0 var(--vz-retro-green), inset 0 0 0 1px rgb(0 255 135 / 72%), var(--vz-shadow-glow-green); }
.pinnedRow,
.mobilePinnedCard { background: rgb(255 194 71 / 7%); box-shadow: inset 4px 0 0 var(--vz-retro-gold); }
.pointsCell,
.mobilePoints { color: var(--vz-retro-cyan); }
.rankCell { font-family: var(--vz-font-display); font-weight: 700; }
.mobileCard { border: 1px solid var(--vz-retro-line); }
.mobileSummary { font-family: var(--vz-font-display); letter-spacing: 0.06em; text-transform: uppercase; }
CSS

append_block "src/features/competitions/components/CompetitionPrimitives.module.css" "RETRO_COMPETITIONS" <<'CSS'
.card,
.summary,
.filterBar,
.stateCard {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
.card:hover { border-color: rgb(255 194 71 / 62%); box-shadow: var(--vz-shadow-glow-gold); transform: translateY(-2px); }
.title,
.label { font-family: var(--vz-font-display); letter-spacing: 0.07em; text-transform: uppercase; }
CSS

append_block "src/features/matches/components/MatchPrimitives.module.css" "RETRO_MATCHES" <<'CSS'
.card,
.matchCard,
.stateCard,
.timeline {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
.versus { color: var(--vz-retro-green); text-shadow: 0 0 18px rgb(0 255 135 / 30%); }
.title,
.label { font-family: var(--vz-font-display); letter-spacing: 0.07em; text-transform: uppercase; }
CSS

append_block "src/components/primitives/intel-card/IntelCard.module.css" "RETRO_INTEL" <<'CSS'
.card,
.surface {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
.card:hover { border-color: rgb(155 98 255 / 60%); box-shadow: var(--vz-shadow-glow-purple); transform: translateY(-2px); }
.title,
.eyebrow { font-family: var(--vz-font-display); letter-spacing: 0.07em; text-transform: uppercase; }
CSS

append_block "src/features/auth/ui/AuthScreens.module.css" "RETRO_AUTH" <<'CSS'
.shell {
  background:
    radial-gradient(circle at 20% 10%, rgb(0 229 255 / 10%), transparent 28rem),
    radial-gradient(circle at 82% 20%, rgb(155 98 255 / 10%), transparent 30rem),
    #020305;
}
.brandMark {
  color: #020305;
  border-color: var(--vz-retro-green);
  background: var(--vz-retro-green);
  box-shadow: var(--vz-shadow-glow-green);
  clip-path: var(--vz-retro-cut-sm);
}
.brandName { color: transparent; background: linear-gradient(90deg, var(--vz-retro-cyan), var(--vz-retro-purple)); background-clip: text; -webkit-background-clip: text; }
.card,
.securityPanel,
.statePanel,
.loadingPanel {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-lg);
}
.inputShell { border-color: var(--vz-retro-line); background: #050609; clip-path: var(--vz-retro-cut-sm); }
.input:focus-visible { border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-focus); }
.primaryAction { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); clip-path: var(--vz-retro-cut-sm); }
.secondaryButton { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 52%); clip-path: var(--vz-retro-cut-sm); }
CSS

append_block "src/features/auth/forms/AuthForms.module.css" "RETRO_AUTH_FORMS" <<'CSS'
.inputShell,
.errorSummary,
.statusMessage,
.rateLimitMessage,
.successMessage {
  border-color: var(--vz-retro-line);
  background: #050609;
  clip-path: var(--vz-retro-cut-sm);
}
.input:focus-visible,
.codeInput:focus-visible { border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-focus); }
.submitButton { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); clip-path: var(--vz-retro-cut-sm); }
.retryButton { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 52%); clip-path: var(--vz-retro-cut-sm); }
CSS

append_block "src/features/onboarding/ui/onboarding-experience.module.css" "RETRO_ONBOARDING" <<'CSS'
.page,
.loadingPage {
  background:
    radial-gradient(circle at 15% 10%, rgb(0 229 255 / 9%), transparent 28rem),
    radial-gradient(circle at 90% 24%, rgb(155 98 255 / 9%), transparent 28rem),
    #020305;
}
.brandMark { color: #020305; background: var(--vz-retro-green); border-color: var(--vz-retro-green); box-shadow: var(--vz-shadow-glow-green); clip-path: var(--vz-retro-cut-sm); }
.brandCopy strong { color: transparent; background: linear-gradient(90deg, var(--vz-retro-cyan), var(--vz-retro-purple)); background-clip: text; -webkit-background-clip: text; }
.stepRail,
.contextPanel,
.statePanel,
.optionCard,
.crewCard,
.benefitGrid article,
.summaryGrid article {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
.railStepActive,
.optionCardSelected,
.crewCardSelected {
  border-color: var(--vz-retro-green);
  background: rgb(0 255 135 / 7%);
  box-shadow: var(--vz-shadow-glow-green);
}
.railNumber,
.optionCheck { border-color: rgb(155 98 255 / 48%); background: #050609; }
.railStepActive .railNumber,
.optionCardSelected .optionCheck,
.crewCardSelected .optionCheck { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); }
.primaryButton { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); clip-path: var(--vz-retro-cut-sm); }
.gameGrid,
.crewGrid { gap: 0.85rem; }
.optionIcon,
.crewLogo { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 44%); background: rgb(0 229 255 / 6%); box-shadow: var(--vz-shadow-glow-cyan); }
CSS

append_block "src/features/play/ui/play-command-center.module.css" "RETRO_PLAY" <<'CSS'
.playRoot {
  --play-green: var(--vz-retro-green);
  --play-cyan: var(--vz-retro-cyan);
  --play-purple: var(--vz-retro-purple);
  --play-orange: var(--vz-retro-orange);
  --play-red: var(--vz-retro-red);
  background: transparent;
}

.widget,
.statusStrip,
.globalBanner,
.matchCard,
.checkInControl,
.opportunityList article,
.quickActionGrid a {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}

.widgetHeader h2,
.pageHeader h1,
.quickActionGrid strong,
.opportunityList article strong {
  font-family: var(--vz-font-display);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.quickActionGrid a:nth-child(4n + 1) { color: var(--vz-retro-green); border-color: rgb(0 255 135 / 42%); }
.quickActionGrid a:nth-child(4n + 2) { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 42%); }
.quickActionGrid a:nth-child(4n + 3) { color: var(--vz-retro-orange); border-color: rgb(255 138 31 / 42%); }
.quickActionGrid a:nth-child(4n + 4) { color: var(--vz-retro-purple); border-color: rgb(155 98 255 / 42%); }
.quickActionGrid a:hover { transform: translateY(-2px); box-shadow: var(--vz-shadow-glow-cyan); }

.opportunityList article:nth-child(3n + 1) { border-color: rgb(255 194 71 / 48%); }
.opportunityList article:nth-child(3n + 2) { border-color: rgb(0 229 255 / 48%); }
.opportunityList article:nth-child(3n + 3) { border-color: rgb(155 98 255 / 48%); }

.playerAvatar,
.competitorMark,
.crewIdentity > span {
  border-color: var(--vz-retro-green);
  box-shadow: var(--vz-shadow-glow-green);
}

.primaryLink,
.checkInControl > button {
  color: #020305;
  border-color: var(--vz-retro-green);
  background: var(--vz-retro-green);
  clip-path: var(--vz-retro-cut-sm);
}

.secondaryLink {
  color: var(--vz-retro-cyan);
  border-color: rgb(0 229 255 / 52%);
  background: rgb(0 229 255 / 5%);
  clip-path: var(--vz-retro-cut-sm);
}

.progressTrack span { background: linear-gradient(90deg, var(--vz-retro-green), var(--vz-retro-cyan)); }
CSS

append_block "src/components/layout/app-shell/PlatformRoute.module.css" "RETRO_PLATFORM_ROUTE" <<'CSS'
.root,
.section,
.card,
.notice {
  border-color: var(--vz-retro-line);
  background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%));
  clip-path: var(--vz-retro-cut-md);
}
CSS

append_block "src/components/layout/app-shell/ShellOverlays.module.css" "RETRO_SHELL_OVERLAYS" <<'CSS'
.searchInput,
.shortcut,
.profileContent,
.notificationItem {
  border-color: var(--vz-retro-line);
  background: #050609;
  clip-path: var(--vz-retro-cut-sm);
}
.shortcut:hover { border-color: rgb(0 229 255 / 52%); background: rgb(0 229 255 / 5%); }
.primaryAction { color: #020305; border-color: var(--vz-retro-green); background: var(--vz-retro-green); clip-path: var(--vz-retro-cut-sm); }
.secondaryAction { color: var(--vz-retro-cyan); border-color: rgb(0 229 255 / 52%); clip-path: var(--vz-retro-cut-sm); }
CSS

append_block "src/features/crews/intel-card/CrewIntelCard.module.css" "RETRO_CREW_INTEL" <<'CSS'
.root,
.card { border-color: var(--vz-retro-line); background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%)); clip-path: var(--vz-retro-cut-md); }
CSS
append_block "src/features/matches/intel-card/MatchIntelCard.module.css" "RETRO_MATCH_INTEL" <<'CSS'
.root,
.card { border-color: var(--vz-retro-line); background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%)); clip-path: var(--vz-retro-cut-md); }
CSS
append_block "src/features/profiles/intel-card/PlayerIntelCard.module.css" "RETRO_PLAYER_INTEL" <<'CSS'
.root,
.card { border-color: var(--vz-retro-line); background: linear-gradient(180deg, rgb(12 14 20 / 98%), rgb(5 6 9 / 98%)); clip-path: var(--vz-retro-cut-md); }
CSS
}

write_design_doc() {
  mkdir -p "$(dirname "$DESIGN_DOC")"
  cat > "$DESIGN_DOC" <<'EOF'
# VERZUS Retro-Competitive Visual System

Status: Approved visual direction.

## Visual hierarchy

- Deep black canvas and near-black surfaces own most of the screen.
- Neon green owns primary action, success, current position and active navigation.
- Cyan owns information and secondary interaction.
- Purple owns game lanes, rare status and supporting framing.
- Orange and gold own rewards, progression, prizes and top rank.
- Red owns loss, danger, urgent live status and destructive action.
- Pink is allowed only as a tiny notification or rare cosmetic accent.

## Shape language

- Clipped top-left and bottom-right corners.
- One-pixel borders.
- Low-opacity grid and scanline atmosphere.
- Uppercase Rajdhani headings with tracked labels.
- Inter body text and tabular numerics.
- Glow is reserved for current, selected, live or focused states.

## Responsive rule

Mobile is the primary composition. Dense desktop tables become ranked cards. Navigation remains the existing shell navigation and bottom navigation rather than duplicated page-owned navigation.
EOF
}

write_verifier() {
  cat > "$VERIFY_SCRIPT" <<'EOF'
import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'data-theme="retro-competitive"'],
  ["src/app/layout.tsx", 'import "@/styles/verzus-retro-system.css";'],
  ["src/styles/verzus-retro-system.css", "--vz-retro-green: #00ff87"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS RETRO_SHELL START"],
  ["src/components/primitives/button/Button.module.css", "VERZUS RETRO_BUTTONS START"],
  ["src/features/leaderboards/components/Leaderboard.module.css", "VERZUS RETRO_LEADERBOARD START"],
  ["src/features/onboarding/ui/onboarding-experience.module.css", "VERZUS RETRO_ONBOARDING START"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS RETRO_PLAY START"],
];

const failures = [];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(fragment)) failures.push(`${file}: missing ${fragment}`);
}

if (failures.length > 0) {
  console.error("Retro UI verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Retro UI installation markers: PASS");
EOF

  node <<'NODE'
const fs = require("node:fs");
const file = "package.json";
const json = JSON.parse(fs.readFileSync(file, "utf8"));
json.scripts ??= {};
json.scripts["verify:retro-ui"] = "node scripts/verify-retro-ui.mjs";
fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
NODE
}

ensure_ignores() {
  add_exact_line .prettierignore ".verzus-backups/"
  add_exact_line .prettierignore "reports/"
  add_exact_line .prettierignore "storybook-static/"
  add_exact_line .gitignore "/.verzus-backups/"
  add_exact_line .gitignore "/reports/"
  add_exact_line .gitignore "/storybook-static/"

  node <<'NODE'
const fs = require("node:fs");
const file = "eslint.config.mjs";
let source = fs.readFileSync(file, "utf8");
const patterns = [".verzus-backups/**", "reports/**", "storybook-static/**"];
const start = source.indexOf("globalIgnores([");
if (start >= 0) {
  const open = source.indexOf("[", start);
  const close = source.indexOf("])", open);
  if (open >= 0 && close >= 0) {
    let body = source.slice(open + 1, close);
    for (const pattern of patterns) {
      if (!body.includes(`\"${pattern}\"`) && !body.includes(`'${pattern}'`)) {
        body = `\n    \"${pattern}\",` + body;
      }
    }
    source = source.slice(0, open + 1) + body + source.slice(close);
    fs.writeFileSync(file, source, "utf8");
  }
}
NODE
}

install_theme() {
  require_approval
  require_repo
  print_plan
  echo
  backup_files
  write_theme
  patch_root_layout
  write_overrides
  write_design_doc
  write_verifier
  ensure_ignores

  echo
  echo "Formatting changed files..."
  npx prettier \
    "$ROOT_LAYOUT" \
    "$THEME_FILE" \
    "$VERIFY_SCRIPT" \
    "$DESIGN_DOC" \
    "package.json" \
    "eslint.config.mjs" \
    "${FILES[@]:2:33}" \
    --write

  echo
  npm run verify:retro-ui
  echo "Whole-platform retro visual system installed."
}

verify_theme() {
  require_repo
  npm run verify:retro-ui
  npm run format:check
  npm run lint
  npm run typecheck
  npm run test
  npm run check:boundaries
  npm run build
  echo "Whole-platform verification passed."
}

preview_theme() {
  require_repo
  echo "Starting VERZUS on http://127.0.0.1:3110"
  echo "Review /login, /onboarding, /play, /leaderboards/weekly, /compete and /matches."
  npm run m5:play
}

rollback_theme() {
  local latest
  if [[ ! -f .verzus-backups/retro-system/LATEST ]]; then
    echo "No retro-system backup manifest found."
    exit 1
  fi
  latest="$(cat .verzus-backups/retro-system/LATEST)"
  if [[ ! -d "$latest" ]]; then
    echo "Backup directory not found: $latest"
    exit 1
  fi

  while IFS= read -r -d '' file; do
    rel="${file#${latest}/}"
    mkdir -p "$(dirname "$rel")"
    cp "$file" "$rel"
  done < <(find "$latest" -type f -print0)

  if [[ ! -f "$latest/$THEME_FILE" ]]; then rm -f "$THEME_FILE"; fi
  if [[ ! -f "$latest/$VERIFY_SCRIPT" ]]; then rm -f "$VERIFY_SCRIPT"; fi
  if [[ ! -f "$latest/$DESIGN_DOC" ]]; then rm -f "$DESIGN_DOC"; fi
  echo "Rollback restored from $latest"
}

case "$MODE" in
  install) install_theme ;;
  verify) verify_theme ;;
  preview) preview_theme ;;
  rollback) rollback_theme ;;
  all) install_theme; verify_theme ;;
  *)
    echo "Valid modes: install | verify | preview | rollback | all"
    exit 1
    ;;
esac
