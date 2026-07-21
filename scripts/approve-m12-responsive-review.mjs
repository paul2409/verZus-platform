// VERZUS M12.8 RESPONSIVE REVIEW APPROVAL

import fs from "node:fs";

const reviewPath = "docs/milestones/M12/m12-responsive-review.json";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const approvedBy = readArgument("--by")?.trim();
const evidence = readArgument("--evidence")?.trim();

if (!approvedBy) {
  console.error('Usage: npm run approve:m12:responsive -- --by "Reviewer name" [--evidence "URL or ticket"]');
  process.exit(1);
}

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

if (review.milestone !== "M12" || review.stage !== "12.8") {
  throw new Error("M12.8 responsive-review contract was not recognized.");
}

review.status = "approved";
review.approvedBy = approvedBy;
review.approvedAt = new Date().toISOString();
review.evidence = evidence
  ? Array.from(new Set([...(Array.isArray(review.evidence) ? review.evidence : []), evidence]))
  : Array.isArray(review.evidence)
    ? review.evidence
    : [];

fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
console.log(`M12 responsive review approved by ${approvedBy}.`);
