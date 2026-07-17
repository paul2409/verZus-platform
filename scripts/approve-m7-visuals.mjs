// VERZUS M7.8 VISUAL APPROVAL

import fs from "node:fs";

const file = "docs/milestones/M7/m7-reference-approval.json";
const token = process.env.VERZUS_M7_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M7_APPROVED_BY?.trim();

if (token !== "APPROVED" || !approvedBy) {
  console.error(
    'Approval requires VERZUS_M7_VISUAL_APPROVAL=APPROVED and VERZUS_M7_APPROVED_BY="name".',
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.releaseGate = {
  status: "approved",
  stage: "7.8",
  approvedAt: new Date().toISOString(),
  approvedBy,
  requiredViewports: [390, 768, 1440],
  requiredSnapshotCount: 45,
};
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M7 visual approval recorded for ${approvedBy}.`);
