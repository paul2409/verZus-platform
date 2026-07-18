// VERZUS M10.8 VISUAL APPROVAL RECORDER AND RELEASE GATE

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "docs/milestones/M10/m10-reference-approval.json");
const checkOnly = process.argv.includes("--check");

if (!fs.existsSync(file)) {
  console.error("M10 approval manifest is missing.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(file, "utf8"));

if (checkOnly) {
  if (manifest.releaseGate?.status !== "approved") {
    console.error("M10 release is blocked: responsive visual approval is still pending.");
    console.error(
      'Run VERZUS_M10_VISUAL_APPROVAL=APPROVED VERZUS_M10_APPROVED_BY="<name>" npm run m10:approve after review.',
    );
    process.exit(1);
  }

  console.log(
    `M10 visual release gate approved by ${manifest.releaseGate.approvedBy} at ${manifest.releaseGate.approvedAt}.`,
  );
  process.exit(0);
}

const approvalValue = process.env.VERZUS_M10_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M10_APPROVED_BY?.trim();

if (approvalValue !== "APPROVED" || !approvedBy) {
  console.error(
    'Set VERZUS_M10_VISUAL_APPROVAL=APPROVED and VERZUS_M10_APPROVED_BY="<name>" after manual review.',
  );
  process.exit(1);
}

const snapshotDirectory = path.join(root, "tests/visual/m10-rewards.visual.spec.ts-snapshots");
const snapshots = fs.existsSync(snapshotDirectory)
  ? fs
      .readdirSync(snapshotDirectory)
      .filter((entry) => entry.endsWith(".png"))
      .sort()
  : [];

manifest.releaseGate = {
  status: "approved",
  stage: "10.8",
  approvedAt: new Date().toISOString(),
  approvedBy,
  reviewedViewports: [390, 768, 1440],
  snapshots,
  note: "390px follows the approved mobile reference. Larger widths approve safe containment only until dedicated tablet and desktop compositions are generated.",
};

fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M10.8 responsive release review recorded as approved by ${approvedBy}.`);
