// VERZUS M11.8 VISUAL APPROVAL RECORDER AND RELEASE GATE

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "docs/milestones/M11/m11-reference-approval.json");
const checkOnly = process.argv.includes("--check");

if (!fs.existsSync(file)) {
  console.error("M11 approval manifest is missing.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(file, "utf8"));

if (checkOnly) {
  if (manifest.releaseGate?.status !== "approved") {
    console.error("M11 release is blocked: responsive visual approval is still pending.");
    console.error(
      'Run VERZUS_M11_VISUAL_APPROVAL=APPROVED VERZUS_M11_APPROVED_BY="<name>" npm run m11:approve after review.',
    );
    process.exit(1);
  }

  console.log(
    `M11 visual release gate approved by ${manifest.releaseGate.approvedBy} at ${manifest.releaseGate.approvedAt}.`,
  );
  process.exit(0);
}

const approvalValue = process.env.VERZUS_M11_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M11_APPROVED_BY?.trim();

if (approvalValue !== "APPROVED" || !approvedBy) {
  console.error(
    'Set VERZUS_M11_VISUAL_APPROVAL=APPROVED and VERZUS_M11_APPROVED_BY="<name>" after manual review.',
  );
  process.exit(1);
}

const snapshotDirectory = path.join(root, "tests/visual/m11-profiles.visual.spec.ts-snapshots");
const snapshots = fs.existsSync(snapshotDirectory)
  ? fs
      .readdirSync(snapshotDirectory)
      .filter((entry) => entry.endsWith(".png"))
      .sort()
  : [];

manifest.stage = "11.8";
manifest.releaseGate = {
  status: "approved",
  stage: "11.8",
  approvedAt: new Date().toISOString(),
  approvedBy,
  reviewedViewports: [390, 768, 1440],
  snapshots,
  note: "Own, public, editing, history, progression, privacy and account-state surfaces were manually reviewed. The 390px hierarchy remains authoritative; larger layouts approve their current responsive compositions.",
};

fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M11.8 responsive release review recorded as approved by ${approvedBy}.`);
