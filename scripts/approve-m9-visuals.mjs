// VERZUS M9.8 OPTIONAL VISUAL APPROVAL RECORDER

import fs from "node:fs";
import path from "node:path";

const approvalValue = process.env.VERZUS_M9_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M9_APPROVED_BY?.trim();

if (approvalValue !== "APPROVED" || !approvedBy) {
  console.error(
    'Set VERZUS_M9_VISUAL_APPROVAL=APPROVED and VERZUS_M9_APPROVED_BY="<name>" after review.',
  );
  process.exit(1);
}

const snapshotDirectory = path.join(
  process.cwd(),
  "tests/visual/m9-crews.visual.spec.ts-snapshots",
);
const snapshots = fs.existsSync(snapshotDirectory)
  ? fs.readdirSync(snapshotDirectory).filter((file) => file.endsWith(".png"))
  : [];

const file = path.join(process.cwd(), "docs/milestones/M9/m9-reference-approval.json");
const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.releaseGate = {
  status: "approved",
  stage: "9.8",
  approvedAt: new Date().toISOString(),
  approvedBy,
  snapshots: snapshots.sort(),
};
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M9.8 visuals recorded as approved by ${approvedBy}.`);
