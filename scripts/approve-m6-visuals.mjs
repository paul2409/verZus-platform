// VERZUS M6.7 VISUAL APPROVAL

import fs from "node:fs";

const file = "docs/milestones/M6/m6-reference-approval.json";
const token = process.env.VERZUS_M6_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M6_APPROVED_BY?.trim();

if (token !== "APPROVED" || !approvedBy) {
  console.error(
    'Approval requires VERZUS_M6_VISUAL_APPROVAL=APPROVED and VERZUS_M6_APPROVED_BY="name".',
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.status = "approved";
manifest.approvedAt = new Date().toISOString();
manifest.approvedBy = approvedBy;
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M6 visual approval recorded for ${approvedBy}.`);
