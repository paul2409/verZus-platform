// VERZUS M4 STEP 4.11

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const technicalOnly = args.has("--technical");
const reportOnly = args.has("--report-only");

const requiredFiles = [
  "src/features/auth/model/auth-state.ts",
  "src/features/auth/server/auth-route-policy.ts",
  "src/features/auth/security/auth-failure.policy.ts",
  "src/features/auth/api/auth-session-refresh.client.ts",
  "src/features/onboarding/model/onboarding.state-machine.ts",
  "src/features/onboarding/api/onboarding-api.client.ts",
  "src/features/onboarding/security/onboarding-failure.policy.ts",
  "src/features/onboarding/contracts/onboarding-screen.contract.ts",
  "src/shared/failures/app-failure.schema.ts",
  "tests/integration/m4/register-to-play.integration.test.ts",
  "tests/integration/m4/session-expiry.failure-injection.test.ts",
  "tests/integration/m4/security-failures.integration.test.ts",
];

const requiredRoutes = [
  "src/app/login/page.tsx",
  "src/app/register/page.tsx",
  "src/app/verify-email/page.tsx",
  "src/app/forgot-password/page.tsx",
  "src/app/reset-password/page.tsx",
  "src/app/session-expired/page.tsx",
  "src/app/account/suspended/page.tsx",
  "src/app/account/banned/page.tsx",
  "src/app/api/auth/login/route.ts",
  "src/app/api/auth/register/route.ts",
  "src/app/api/auth/session/refresh/route.ts",
  "src/app/api/onboarding/progress/route.ts",
  "src/app/api/onboarding/complete/route.ts",
];

const missingFiles = [...requiredFiles, ...requiredRoutes].filter(
  (relativePath) => !fs.existsSync(path.join(root, relativePath)),
);

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const requiredScripts = [
  "lint",
  "typecheck",
  "test",
  "build",
  "verify",
  "test:m4",
  "m4:verify:technical",
  "m4:verify",
];

const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);

const technicalPassed = missingFiles.length === 0 && missingScripts.length === 0;

const manifestPath = path.join(root, "docs/milestones/M4/m4-approval-manifest.json");

let approval = {
  approved: false,
  blockers: ["Approval manifest is missing."],
};

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const referenceBlockers = [];

  for (const [screen, states] of Object.entries(manifest.references ?? {})) {
    if (states.mobile390 !== "approved") {
      referenceBlockers.push(`${screen}: mobile390 is ${states.mobile390}`);
    }

    if (!["approved", "not_required"].includes(states.tablet768)) {
      referenceBlockers.push(`${screen}: tablet768 is ${states.tablet768}`);
    }

    if (states.desktop1440 !== "approved") {
      referenceBlockers.push(`${screen}: desktop1440 is ${states.desktop1440}`);
    }
  }

  const signoffBlockers = Object.entries(manifest.signoff ?? {})
    .filter(([, value]) => value !== true)
    .map(([name]) => `${name} signoff is missing`);

  const blockers = [...referenceBlockers, ...signoffBlockers];

  approval = {
    approved: manifest.approved === true && blockers.length === 0,
    blockers,
  };
}

const playwrightInstalled = Boolean(
  packageJson.devDependencies?.["@playwright/test"] ??
  packageJson.dependencies?.["@playwright/test"],
);

const report = {
  marker: "VERZUS M4 STEP 4.11",
  generatedAt: new Date().toISOString(),
  technical: {
    passed: technicalPassed,
    missingFiles,
    missingScripts,
    playwrightInstalled,
  },
  approval,
  milestoneComplete: technicalPassed && approval.approved,
};

const reportPath = path.join(root, "reports/m4-verification.json");

fs.mkdirSync(path.dirname(reportPath), {
  recursive: true,
});
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("\nM4 verification report");
console.log("======================");
console.log(`Technical gate: ${technicalPassed ? "PASS" : "FAIL"}`);

if (missingFiles.length > 0) {
  console.log("\nMissing files:");
  for (const file of missingFiles) {
    console.log(`- ${file}`);
  }
}

if (missingScripts.length > 0) {
  console.log("\nMissing package scripts:");
  for (const script of missingScripts) {
    console.log(`- ${script}`);
  }
}

console.log(`Playwright available: ${playwrightInstalled ? "yes" : "no"}`);

if (!technicalOnly) {
  console.log(`Approval gate: ${approval.approved ? "PASS" : "BLOCKED"}`);

  if (approval.blockers.length > 0) {
    console.log("\nApproval blockers:");
    for (const blocker of approval.blockers) {
      console.log(`- ${blocker}`);
    }
  }
}

console.log(`\nReport: ${reportPath}`);

if (!technicalPassed) {
  process.exitCode = 1;
} else if (!technicalOnly && !reportOnly && !approval.approved) {
  process.exitCode = 2;
}
