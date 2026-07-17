#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M8_10_2_Desktop_Leaderboard_Polish.sh"
BACKUP_ROOT=".verzus-backups/m8-10-2-desktop-leaderboard-polish"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m8-10-2-before.tar.gz"
INSTALL_ACTIVE=0

print_plan() {
  cat <<'PLAN'
VERZUS M8.10.2 - Desktop Leaderboard Rebalance and Premium Polish

KEEP
  - M8 data contracts, query resources, live-update stability and reliability states
  - Separate mobile ranking-list presentation
  - Player, Crew and Match intel-card interactions
  - Rank-zone colors, movement indicators and placement rewards
  - Semantic desktop table and accessible sorting metadata

REUSE
  - M8.10.1 compact density foundation
  - Existing mode-owned columns and responsive App Shell
  - Existing URL search, filter, sort and pagination state
  - Existing current-position side resource and widget boundaries

REPLACE
  - Horizontally scrolling desktop table with a width-balanced fixed table
  - Duplicate Crew metadata inside Player cells with compact handle and country metadata
  - Plain Crew affiliation text with an explicit Crew intel trigger
  - Five-row default pagination with a ten-row desktop-friendly default
  - Detached duplicate current-player table row with the existing side-rail position card
  - Oversized desktop filter controls with a compact command strip

DELETE
  - Desktop horizontal scrollbar
  - Wrapped records, points and recent-match values
  - Redundant desktop pinned row when the current-position rail is present
  - Unnecessary pagination controls when every filtered row fits on one page
  - Excess control-bar and side-rail whitespace

CREATE
  - Mode-aware desktop column width contract
  - Table-specific two-line identity anatomy
  - Clickable Crew affiliation cells
  - Compact 58px ranking rows and 42px headers
  - Default ten-row result window
  - No-overflow and interaction regression tests
  - Documentation, verifier and timestamped rollback archive
PLAN
}

require_repo_root() {
  [[ -f package.json && -d src/features/leaderboards && -d src/app ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root."
    exit 1
  }
}

require_prerequisites() {
  require_repo_root

  local required=(
    package.json
    src/features/leaderboards/explorer/model/leaderboard-query-state.ts
    src/features/leaderboards/modes/model/leaderboard-mode.registry.ts
    src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css
    src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx
    src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx
    src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing leaderboard prerequisite: $file"
      exit 1
    }
  done

  grep -q 'VERZUS M8.10.1 COMPACT TWO-LINE IDENTITY' \
    src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx || {
      echo "Error: M8.10.1 compact desktop density is not installed."
      echo "Install VERZUS_M8_10_1_Compact_Desktop_Leaderboard_Density.sh first."
      exit 1
    }

  if [[ -f scripts/verify-m8-10-1-density.mjs ]]; then
    echo "Running M8.10.1 prerequisite marker verification..."
    node scripts/verify-m8-10-1-density.mjs
  else
    echo "Error: scripts/verify-m8-10-1-density.mjs is missing."
    exit 1
  fi

  local owned_new_files=(
    docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md
    scripts/verify-m8-10-2-polish.mjs
    src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx
    tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts
    playwright.m8-polish.config.ts
  )

  for file in "${owned_new_files[@]}"; do
    if [[ -f "$file" ]] && ! grep -q 'VERZUS M8.10.2' "$file"; then
      echo "Error: refusing to overwrite unowned file: $file"
      exit 1
    fi
  done
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  local paths=(
    package.json
    src/features/leaderboards/explorer/model/leaderboard-query-state.ts
    src/features/leaderboards/modes/model/leaderboard-mode.registry.ts
    src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css
    src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx
    src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx
    src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css
  )

  local optional=(
    docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md
    scripts/verify-m8-10-2-polish.mjs
    src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx
    tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts
    playwright.m8-polish.config.ts
  )

  local file
  for file in "${optional[@]}"; do
    [[ -f "$file" ]] && paths+=("$file")
  done

  tar -czf "$ARCHIVE" "${paths[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M8.10.2 desktop leaderboard polish backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  echo "Rollback archive created: $ARCHIVE"
}

restore_archive() {
  local archive="$1"

  rm -f \
    docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md \
    scripts/verify-m8-10-2-polish.mjs \
    src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx \
    tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts \
    playwright.m8-polish.config.ts

  tar -xzf "$archive"
}

restore_after_failure() {
  local status=$?
  if [[ "$INSTALL_ACTIVE" -eq 1 && -f "$ARCHIVE" ]]; then
    echo
    echo "M8.10.2 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$status"
}

patch_query_defaults() {
  node <<'NODE'
const fs = require("node:fs");

const queryFile = "src/features/leaderboards/explorer/model/leaderboard-query-state.ts";
let querySource = fs.readFileSync(queryFile, "utf8");

if (!querySource.includes("VERZUS M8.10.2 TEN-ROW DEFAULT")) {
  querySource = querySource.replace(
    "// VERZUS M8.2 LEADERBOARD QUERY-STRING STATE",
    "// VERZUS M8.2 LEADERBOARD QUERY-STRING STATE\n// VERZUS M8.10.2 TEN-ROW DEFAULT",
  );
}
querySource = querySource.replace(/pageSize: 5,/, "pageSize: 10,");
querySource = querySource.replace(/state\.pageSize !== 5/g, "state.pageSize !== 10");

if (!querySource.includes("pageSize: 10,")) {
  throw new Error("Could not set the default leaderboard page size to 10.");
}
fs.writeFileSync(queryFile, querySource);

const registryFile = "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts";
let registrySource = fs.readFileSync(registryFile, "utf8");
if (!registrySource.includes("VERZUS M8.10.2 TEN-ROW DEFAULT")) {
  registrySource = registrySource.replace(
    "// VERZUS M8.4 MODE REGISTRY AND QUERY POLICY",
    "// VERZUS M8.4 MODE REGISTRY AND QUERY POLICY\n// VERZUS M8.10.2 TEN-ROW DEFAULT",
  );
}
registrySource = registrySource.replace(/state\.pageSize !== 5/g, "state.pageSize !== 10");
fs.writeFileSync(registryFile, registrySource);
NODE
}

patch_interactive_identity() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx";
let source = fs.readFileSync(file, "utf8");

if (!source.includes("VERZUS M8.10.2 TABLE IDENTITY AND AFFILIATION LINKS")) {
  source = source.replace(
    "// VERZUS M8.10.1 COMPACT TWO-LINE IDENTITY",
    "// VERZUS M8.10.1 COMPACT TWO-LINE IDENTITY\n// VERZUS M8.10.2 TABLE IDENTITY AND AFFILIATION LINKS",
  );
}

source = source.replace(
  /export function LeaderboardInteractiveIdentity\(\{ row \}: \{ row: LeaderboardFoundationRow \}\) \{/,
  `export function LeaderboardInteractiveIdentity({\n  row,\n  variant = "default",\n}: {\n  row: LeaderboardFoundationRow;\n  variant?: "default" | "table";\n}) {`,
);

const oldSecondary = `  const secondary =\n    row.entityType === "crew" && row.memberCount\n      ? \`\${row.memberCount} members\`\n      : (row.crewName ?? row.handle);`;
const newSecondary = `  const secondary =\n    variant === "table"\n      ? row.entityType === "crew" && row.memberCount\n        ? \`\${row.memberCount} members · \${row.handle}\`\n        : row.entityType === "pool" && row.memberCount\n          ? \`\${row.memberCount} players · \${row.handle}\`\n          : \`\${row.handle} · \${row.countryCode}\`\n      : row.entityType === "crew" && row.memberCount\n        ? \`\${row.memberCount} members\`\n        : (row.crewName ?? row.handle);`;
if (!source.includes(newSecondary)) {
  if (!source.includes(oldSecondary)) {
    throw new Error("Could not locate the interactive identity secondary metadata block.");
  }
  source = source.replace(oldSecondary, newSecondary);
}

const oldAffiliation = `            {interactions.affiliation ? (\n              <>\n                Crew:{" "}\n                <LeaderboardEntityLink descriptor={interactions.affiliation} variant="affiliation">\n                  {interactions.affiliation.label}\n                </LeaderboardEntityLink>\n              </>\n            ) : (\n              secondary\n            )}`;
const newAffiliation = `            {variant === "table" ? (\n              secondary\n            ) : interactions.affiliation ? (\n              <>\n                Crew:{" "}\n                <LeaderboardEntityLink descriptor={interactions.affiliation} variant="affiliation">\n                  {interactions.affiliation.label}\n                </LeaderboardEntityLink>\n              </>\n            ) : (\n              secondary\n            )}`;
if (!source.includes(newAffiliation)) {
  if (!source.includes(oldAffiliation)) {
    throw new Error("Could not locate the interactive identity affiliation block.");
  }
  source = source.replace(oldAffiliation, newAffiliation);
}

if (!source.includes("export function LeaderboardAffiliationLink")) {
  source += `\nexport function LeaderboardAffiliationLink({ row }: { row: LeaderboardFoundationRow }) {\n  const descriptor = getLeaderboardRowInteractions(row).affiliation;\n\n  if (descriptor) {\n    return (\n      <LeaderboardEntityLink descriptor={descriptor} variant="affiliation">\n        {descriptor.label}\n      </LeaderboardEntityLink>\n    );\n  }\n\n  if (row.entityType === "crew" && row.memberCount) {\n    return <span>{row.memberCount.toLocaleString()}</span>;\n  }\n\n  return <span>{row.crewName ?? "—"}</span>;\n}\n`;
}

for (const marker of [
  'variant?: "default" | "table"',
  'variant === "table"',
  "LeaderboardAffiliationLink",
]) {
  if (!source.includes(marker)) throw new Error(`Identity patch missing marker: ${marker}`);
}

fs.writeFileSync(file, source);
NODE
}

patch_entity_link_compatibility() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx";
let source = fs.readFileSync(file, "utf8");

if (!source.includes("VERZUS M8.10.2 NULL-SAFE ROUTER COMPATIBILITY")) {
  source = source.replace(
    "// VERZUS M8.8 LEADERBOARD ENTITY INTEL LINK",
    "// VERZUS M8.8 LEADERBOARD ENTITY INTEL LINK\n// VERZUS M8.10.2 NULL-SAFE ROUTER COMPATIBILITY",
  );
}

source = source.replace(
  `  const href = buildLeaderboardIntelHref(pathname, searchParams, {`,
  `  const href = buildLeaderboardIntelHref(pathname ?? "/leaderboards/weekly", searchParams?.toString() ?? "", {`,
);

if (!source.includes('searchParams?.toString() ?? ""')) {
  throw new Error("Could not install null-safe leaderboard entity URL construction.");
}

fs.writeFileSync(file, source);
NODE
}

patch_mode_presentation() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx";
let source = fs.readFileSync(file, "utf8");

if (!source.includes("VERZUS M8.10.2 WIDTH-BALANCED DESKTOP TABLE")) {
  source = source.replace(
    "// VERZUS M8.8 COLOR BANDS AND ENTITY INTEL TRIGGERS",
    "// VERZUS M8.8 COLOR BANDS AND ENTITY INTEL TRIGGERS\n// VERZUS M8.10.2 WIDTH-BALANCED DESKTOP TABLE",
  );
}

source = source.replace(
  `  getLeaderboardRowVisualState,\n  LeaderboardInteractiveIdentity,\n  LeaderboardRecentMatchLink,`,
  `  getLeaderboardRowVisualState,\n  LeaderboardAffiliationLink,\n  LeaderboardInteractiveIdentity,\n  LeaderboardRecentMatchLink,`,
);

source = source.replace(
  `<td key={column.key}>\n              <RankCell row={row} />\n            </td>`,
  `<td data-column={column.key} key={column.key}>\n              <RankCell row={row} />\n            </td>`,
);
source = source.replace(
  `<td key={column.key}>\n              <LeaderboardInteractiveIdentity row={row} />\n            </td>`,
  `<td data-column={column.key} key={column.key}>\n              <LeaderboardInteractiveIdentity row={row} variant="table" />\n            </td>`,
);
source = source.replace(
  `        if (column.key === "recent-match") {`,
  `        if (column.key === "affiliation") {\n          return (\n            <td data-column={column.key} key={column.key}>\n              <LeaderboardAffiliationLink row={row} />\n            </td>\n          );\n        }\n        if (column.key === "recent-match") {`,
);
source = source.replace(
  `<td key={column.key}>\n              <LeaderboardRecentMatchLink row={row} />\n            </td>`,
  `<td data-column={column.key} key={column.key}>\n              <LeaderboardRecentMatchLink row={row} />\n            </td>`,
);
source = source.replace(
  `            data-align={column.alignment}\n            key={column.key}`,
  `            data-align={column.alignment}\n            data-column={column.key}\n            key={column.key}`,
);
source = source.replace(
  `                data-align={column.alignment}\n                key={column.key}`,
  `                data-align={column.alignment}\n                data-column={column.key}\n                key={column.key}`,
);
source = source.replace(
  `<tbody className={styles.pinnedBody} aria-label={composition.currentPositionLabel}>`,
  `<tbody\n            className={styles.pinnedBody}\n            aria-label={composition.currentPositionLabel}\n            data-desktop-pinned="true"\n          >`,
);

for (const marker of [
  "LeaderboardAffiliationLink",
  'variant="table"',
  "data-column={column.key}",
  'data-desktop-pinned="true"',
]) {
  if (!source.includes(marker)) throw new Error(`Mode presentation patch missing: ${marker}`);
}

fs.writeFileSync(file, source);
NODE
}

patch_screen_pagination() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx";
let source = fs.readFileSync(file, "utf8");

if (!source.includes("VERZUS M8.10.2 SINGLE-PAGE PAGINATION SUPPRESSION")) {
  source = source.replace(
    "// VERZUS M8.9 API-BACKED ENTITY INTEL CARD SYSTEM",
    "// VERZUS M8.9 API-BACKED ENTITY INTEL CARD SYSTEM\n// VERZUS M8.10.2 SINGLE-PAGE PAGINATION SUPPRESSION",
  );
}

const navStart = source.indexOf('                <nav aria-label="Leaderboard pagination" className={styles.pagination}>');
if (navStart < 0) throw new Error("Could not locate leaderboard pagination navigation.");
const navEndMarker = "                </nav>";
const navEnd = source.indexOf(navEndMarker, navStart);
if (navEnd < 0) throw new Error("Could not locate leaderboard pagination end.");
const navBlock = source.slice(navStart, navEnd + navEndMarker.length);

if (!source.includes("page.totalPages > 1 ?")) {
  const wrapped = `                {page.totalPages > 1 ? (\n${navBlock.replace(/^/gm, "  ")}\n                ) : null}`;
  source = source.slice(0, navStart) + wrapped + source.slice(navEnd + navEndMarker.length);
}

fs.writeFileSync(file, source);
NODE
}

patch_foundation_styles() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css";
let source = fs.readFileSync(file, "utf8");

source = source.replace(
  /\n?\/\* VERZUS M8\.10\.2 DESKTOP LEADERBOARD POLISH START \*\/[\s\S]*?\/\* VERZUS M8\.10\.2 DESKTOP LEADERBOARD POLISH END \*\/\n?/g,
  "\n",
);

source = `${source.trimEnd()}\n\n/* VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH START */
@media (min-width: 1024px) {
  .page {
    width: min(100%, 100rem);
    gap: 0.875rem;
    padding: 1rem 1.25rem 1.5rem;
  }

  .controlBar {
    grid-template-columns: minmax(12rem, 0.42fr) minmax(0, 1.58fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .boardHeading {
    align-content: center;
    gap: 0.1rem;
  }

  .boardHeading h2 {
    font-size: 1.35rem;
    line-height: 1.05;
  }

  .boardHeading small,
  .rankingBasis {
    font-size: 0.64rem;
  }

  .controls label {
    gap: 0.2rem;
  }

  .controls label > span {
    font-size: 0.59rem;
  }

  .controls select,
  .searchInput {
    min-height: 2.25rem;
    padding-block: 0.4rem;
    font-size: 0.78rem;
  }

  .searchControl small {
    display: none;
  }

  .layout {
    grid-template-columns: minmax(0, 1fr) 17rem;
    gap: 0.75rem;
  }

  .rankingPanel {
    overflow: clip;
  }

  .freshness {
    min-height: 2.5rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    font-size: 0.65rem;
  }

  .desktopPresentation {
    overflow-x: clip;
  }

  .desktopPresentation table {
    width: 100%;
    min-width: 0;
    table-layout: fixed;
  }

  .desktopPresentation thead tr,
  .desktopPresentation th {
    height: 2.625rem;
  }

  .desktopPresentation th {
    padding: 0.42rem 0.5rem;
    overflow: hidden;
    font-size: 0.58rem;
    line-height: 1.05;
    text-overflow: ellipsis;
    white-space: normal;
  }

  .desktopPresentation tbody tr,
  .desktopPresentation tbody td,
  .desktopPresentation tbody tr[data-rank-zone="champion"] td,
  .desktopPresentation tbody tr[data-rank-zone="podium"] td {
    height: 3.625rem;
  }

  .desktopPresentation tbody td {
    min-width: 0;
    padding: 0.38rem 0.5rem;
    overflow: hidden;
    font-size: 0.72rem;
    line-height: 1.08;
    text-overflow: ellipsis;
  }

  .desktopPresentation td[data-column="record"],
  .desktopPresentation td[data-column="win-rate"],
  .desktopPresentation td[data-column="streak"],
  .desktopPresentation td[data-column="trust"],
  .desktopPresentation td[data-column="points"],
  .desktopPresentation td[data-column="members"],
  .desktopPresentation td[data-column="game"],
  .desktopPresentation td[data-column="recent-match"] {
    white-space: nowrap;
  }

  .desktopPresentation [data-column="rank"] {
    width: 7%;
  }

  .desktopPresentation [data-column="identity"] {
    width: 23%;
  }

  .desktopPresentation [data-column="affiliation"],
  .desktopPresentation [data-column="members"] {
    width: 11%;
  }

  .desktopPresentation [data-column="game"] {
    width: 11%;
  }

  .desktopPresentation [data-column="record"] {
    width: 9%;
  }

  .desktopPresentation [data-column="win-rate"] {
    width: 8%;
  }

  .desktopPresentation [data-column="streak"],
  .desktopPresentation [data-column="trust"] {
    width: 7%;
  }

  .desktopPresentation [data-column="recent-match"] {
    width: 13%;
  }

  .desktopPresentation [data-column="points"] {
    width: 14%;
  }

  .desktopPresentation .identity {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.45rem;
  }

  .desktopPresentation .avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.58rem;
  }

  .desktopPresentation .identityCopy > a,
  .desktopPresentation .identityCopy > strong {
    font-size: 0.76rem;
  }

  .desktopPresentation .identityCopy small {
    font-size: 0.58rem;
  }

  .desktopPresentation .rankCell > strong {
    width: 1.85rem;
    height: 1.85rem;
    font-size: 0.68rem;
  }

  .desktopPresentation .movement {
    font-size: 0.54rem;
  }

  .desktopPresentation .points {
    color: var(--vz-retro-white);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }

  .pinnedBody[data-desktop-pinned="true"] {
    display: none;
  }

  .sideRail {
    position: sticky;
    top: 5.5rem;
    gap: 0.75rem;
  }

  .sideRail > section {
    gap: 0.65rem;
    padding: 0.8rem;
  }

  .currentCard > h2 {
    font-size: 2rem;
    line-height: 1;
  }

  .currentCard dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .currentCard dl > div {
    padding: 0.45rem;
  }

  .currentCard dt {
    font-size: 0.57rem;
  }

  .currentCard dd {
    font-size: 0.75rem;
  }

  .rewardsCard li {
    padding: 0.5rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 1200px) {
  .controls {
    grid-template-columns: minmax(12rem, 1.55fr) repeat(5, minmax(5.7rem, 1fr));
    gap: 0.45rem;
  }

  .searchControl {
    grid-column: auto;
  }
}

@media (min-width: 1440px) {
  .page {
    padding-inline: 1.5rem;
  }

  .layout {
    grid-template-columns: minmax(0, 1fr) 18rem;
  }

  .desktopPresentation th,
  .desktopPresentation td {
    padding-inline: 0.55rem;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .desktopPresentation [data-column="streak"],
  .desktopPresentation [data-column="trust"] {
    display: none;
  }

  .desktopPresentation [data-column="identity"] {
    width: 27%;
  }

  .desktopPresentation [data-column="recent-match"] {
    width: 15%;
  }
}

@media (forced-colors: active) and (min-width: 1024px) {
  .desktopPresentation tbody td {
    background: Canvas;
  }
}
/* VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH END */
`;

fs.writeFileSync(file, source);
NODE
}

patch_interaction_styles() {
  node <<'NODE'
const fs = require("node:fs");
const file = "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css";
let source = fs.readFileSync(file, "utf8");

source = source.replace(
  /\n?\/\* VERZUS M8\.10\.2 COMPACT TABLE INTERACTIONS START \*\/[\s\S]*?\/\* VERZUS M8\.10\.2 COMPACT TABLE INTERACTIONS END \*\/\n?/g,
  "\n",
);

source = `${source.trimEnd()}\n\n/* VERZUS M8.10.2 COMPACT TABLE INTERACTIONS START */
@media (min-width: 1024px) {
  .entityLink[data-variant="affiliation"] {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    color: var(--vz-retro-cyan, var(--vz-retro-violet));
    font-size: 0.72rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entityLink[data-variant="match"] {
    min-height: 1.55rem;
    max-width: 100%;
    padding: 0.1rem 0.32rem;
    overflow: hidden;
    font-size: 0.59rem;
    text-overflow: ellipsis;
  }

  .compactMeta {
    gap: 0.2rem;
  }

  .compactMeta small {
    color: var(--vz-retro-muted);
    font-family: var(--vz-font-numeric);
  }

  .badges {
    gap: 0.15rem;
  }

  .badges > span {
    min-height: 1rem;
    padding: 0.04rem 0.25rem;
    font-size: 0.48rem;
  }
}
/* VERZUS M8.10.2 COMPACT TABLE INTERACTIONS END */
`;

fs.writeFileSync(file, source);
NODE
}

write_unit_test() {
  cat > src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx <<'EOF'
// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH TESTS

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardFoundationScreen } from "./LeaderboardFoundationScreen";

vi.mock("next/navigation", () => ({
  usePathname: () => "/leaderboards/weekly",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("M8.10.2 desktop leaderboard polish", () => {
  it("defaults to ten rows and exposes explicit Player, Crew and Match intel links", () => {
    render(<LeaderboardFoundationScreen initialSearchParams={{ mode: "weekly" }} />);

    expect(screen.getByLabelText("Rows per page")).toHaveValue("10");

    const table = screen.getByRole("table");
    expect(within(table).getByRole("link", { name: /Open Prismo player intel card/i })).toBeVisible();
    expect(within(table).getAllByRole("link", { name: /Open Xenon crew intel card/i }).length).toBeGreaterThan(0);
    expect(within(table).getAllByRole("link", { name: /Open .* match intel card/i }).length).toBeGreaterThan(0);
  });

  it("marks mode-owned columns for deterministic width composition", () => {
    const { container } = render(
      <LeaderboardFoundationScreen initialSearchParams={{ mode: "crew" }} />,
    );

    expect(container.querySelector('th[data-column="identity"]')).toBeInTheDocument();
    expect(container.querySelector('td[data-column="members"]')).toBeInTheDocument();
    expect(container.querySelector('td[data-column="recent-match"]')).toBeInTheDocument();
    expect(container.querySelector('tbody[data-desktop-pinned="true"]')).toBeInTheDocument();
  });
});
EOF
}

write_e2e_test() {
  mkdir -p tests/e2e/m8

  cat > tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts <<'EOF'
// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH E2E

import { expect, test } from "@playwright/test";

test.describe("M8.10.2 desktop leaderboard polish", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("fits the table without horizontal scrolling and keeps rows compact", async ({ page }) => {
    await page.goto("/leaderboards/weekly?mode=weekly");

    const presentation = page.locator('[data-leaderboard-presentation="table"]');
    await expect(presentation).toBeVisible();
    await expect(page.getByLabel("Rows per page")).toHaveValue("10");

    const overflow = await presentation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    const rowHeights = await presentation.locator("tbody:not([data-desktop-pinned]) tr").evaluateAll(
      (rows) => rows.map((row) => Math.round(row.getBoundingClientRect().height)),
    );
    expect(rowHeights.length).toBeGreaterThanOrEqual(6);
    expect(Math.max(...rowHeights)).toBeLessThanOrEqual(64);

    await expect(presentation.locator('tbody[data-desktop-pinned="true"]')).toBeHidden();
    await expect(page.getByRole("link", { name: /Open Xenon crew intel card/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /match intel card/i }).first()).toBeVisible();
  });
});
EOF
}

write_playwright_config() {
  cat > playwright.m8-polish.config.ts <<'EOF'
// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH PLAYWRIGHT CONFIG

import { defineConfig, devices } from "@playwright/test";

const port = 3120;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e/m8",
  testMatch: "m8-leaderboard-desktop-polish.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1440, height: 900 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run m8:preview",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_API_BASE_URL: `${baseURL}/api`,
      NEXT_PUBLIC_ENABLE_MOCKS: "true",
      NEXT_PUBLIC_RELEASE_SHA: "m8-10-2-polish",
    },
  },
});
EOF
}

write_docs() {
  mkdir -p docs/milestones/M8

  cat > docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md <<'EOF'
<!-- VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH -->
# M8.10.2 — Desktop Leaderboard Rebalance and Premium Polish

## Intent

Make the desktop leaderboard readable, colorful and information-dense without horizontal scrolling or duplicate current-player content.

## Desktop contract

- Default result window: 10 rows.
- Header target: 42px.
- Ranking row target: 58px; hard browser-test ceiling: 64px.
- No horizontal table scrollbar at 1440px.
- Player identity: name plus handle/country metadata.
- Crew affiliation: explicit Crew intel link in its own column.
- Match reference: explicit Match intel link.
- Current position: side-rail card on desktop and pinned mobile card on mobile.
- Single-page results do not render inactive pagination controls.
- At 1024–1279px, lower-priority Streak and Trust columns are hidden while their values remain available in intel cards.

## Verification

```bash
npm run verify:m8:10.2
npm run test:m8:10.2:e2e
```

## Rollback

```bash
bash ./VERZUS_M8_10_2_Desktop_Leaderboard_Polish.sh rollback
```
EOF
}

write_verifier() {
  cat > scripts/verify-m8-10-2-polish.mjs <<'EOF'
// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts",
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx",
  "tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts",
  "playwright.m8-polish.config.ts",
  "docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

function expectContains(file, marker) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  const source = fs.readFileSync(location, "utf8");
  if (!source.includes(marker)) failures.push(`${file} is missing marker: ${marker}`);
}

expectContains(
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "pageSize: 10,",
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  'data-column={column.key}',
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "LeaderboardAffiliationLink",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  'variant?: "default" | "table"',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "export function LeaderboardAffiliationLink",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "page.totalPages > 1 ?",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH START",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "table-layout: fixed;",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  '.pinnedBody[data-desktop-pinned="true"]',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "VERZUS M8.10.2 NULL-SAFE ROUTER COMPATIBILITY",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "VERZUS M8.10.2 COMPACT TABLE INTERACTIONS START",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:10.2", "typecheck:m8:10.2", "verify:m8:10.2"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.10.2 desktop leaderboard polish verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.10.2 ten-row default, no-overflow width contract, clickable Crew cells, compact rows and desktop current-position deduplication are installed.",
);
EOF
}

patch_package_scripts() {
  node <<'NODE'
const fs = require("node:fs");
const file = "package.json";
const packageJson = JSON.parse(fs.readFileSync(file, "utf8"));
packageJson.scripts ??= {};
packageJson.scripts["test:m8:10.2"] =
  "vitest run src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx src/features/leaderboards/explorer/model/leaderboard-query-state.test.ts src/features/leaderboards/modes/ui/LeaderboardModePresentation.test.tsx";
packageJson.scripts["typecheck:m8:10.2"] = "tsc --noEmit -p tsconfig.m8-8-9.json";
packageJson.scripts["test:m8:10.2:e2e"] =
  "playwright test --config=playwright.m8-polish.config.ts";
packageJson.scripts["verify:m8:10.2"] =
  "node scripts/verify-m8-10-2-polish.mjs && eslint src/features/leaderboards 'src/app/(platform)/leaderboards' --max-warnings=0 && npm run test:m8:10.2 && npm run typecheck:m8:10.2";
packageJson.scripts["verify:m8:10.2:full"] =
  "npm run verify:m8:10.2 && npm run test:m8:10.2:e2e";
fs.writeFileSync(file, `${JSON.stringify(packageJson, null, 2)}\n`);
NODE
}

format_changed_files() {
  npx prettier --write \
    package.json \
    src/features/leaderboards/explorer/model/leaderboard-query-state.ts \
    src/features/leaderboards/modes/model/leaderboard-mode.registry.ts \
    src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx \
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx \
    src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css \
    src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx \
    src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx \
    src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css \
    src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx \
    tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts \
    playwright.m8-polish.config.ts \
    docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md \
    scripts/verify-m8-10-2-polish.mjs
}

install() {
  print_plan
  echo
  require_prerequisites
  backup_current_state
  INSTALL_ACTIVE=1
  trap restore_after_failure ERR

  patch_query_defaults
  patch_interactive_identity
  patch_entity_link_compatibility
  patch_mode_presentation
  patch_screen_pagination
  patch_foundation_styles
  patch_interaction_styles
  write_unit_test
  write_e2e_test
  write_playwright_config
  write_docs
  write_verifier
  patch_package_scripts
  format_changed_files

  echo "Running lightweight M8.10.2 marker verification..."
  node scripts/verify-m8-10-2-polish.mjs

  INSTALL_ACTIVE=0
  trap - ERR

  cat <<'DONE'

M8.10.2 installation complete.

Focused verification:
  npm run verify:m8:10.2

Browser layout regression:
  npm run test:m8:10.2:e2e

Full focused gate:
  npm run verify:m8:10.2:full

Preview:
  npm run m8:preview

Open:
  http://127.0.0.1:3120/leaderboards/weekly
  http://127.0.0.1:3120/leaderboards/weekly?mode=crew

Rollback:
  bash ./VERZUS_M8_10_2_Desktop_Leaderboard_Polish.sh rollback
DONE
}

rollback() {
  require_repo_root

  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1 || true)"
  [[ -n "$latest" && -f "$latest/verzus-m8-10-2-before.tar.gz" ]] || {
    echo "Error: no M8.10.2 rollback archive found under $BACKUP_ROOT."
    exit 1
  }

  restore_archive "$latest/verzus-m8-10-2-before.tar.gz"
  echo "M8.10.2 rollback restored: $latest/verzus-m8-10-2-before.tar.gz"
}

case "$MODE" in
  install)
    install
    ;;
  rollback)
    rollback
    ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|rollback]"
    exit 1
    ;;
esac
