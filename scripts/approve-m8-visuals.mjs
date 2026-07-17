// VERZUS M8.10 VISUAL APPROVAL RECORDER

import fs from "node:fs";
import path from "node:path";

const approvalValue = process.env.VERZUS_M8_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M8_APPROVED_BY?.trim();

if (approvalValue !== "APPROVED" || !approvedBy) {
  console.error(
    'Set VERZUS_M8_VISUAL_APPROVAL=APPROVED and VERZUS_M8_APPROVED_BY="<name>" after reviewing all M8 snapshots.',
  );
  process.exit(1);
}

const snapshotDirectory = path.join(
  process.cwd(),
  "tests/visual/m8-leaderboards.visual.spec.ts-snapshots",
);
const snapshots = fs.existsSync(snapshotDirectory)
  ? fs.readdirSync(snapshotDirectory).filter((file) => file.endsWith(".png"))
  : [];

if (snapshots.length < 12) {
  console.error(
    `Expected at least 12 M8 visual snapshots across 390px, 768px and 1440px; found ${snapshots.length}. Run npm run m8:visual:update first.`,
  );
  process.exit(1);
}

const file = path.join(process.cwd(), "docs/milestones/M8/m8-reference-approval.json");
const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.releaseGate = {
  status: "approved",
  stage: "8.10",
  approvedAt: new Date().toISOString(),
  approvedBy,
  snapshots: snapshots.sort(),
};
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M8.10 visuals approved by ${approvedBy}.`);
