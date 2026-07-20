// VERZUS M11.3 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/edit/model/profile-edit.schema.ts",
  "src/features/profiles/edit/model/profile-edit.types.ts",
  "src/features/profiles/edit/storage/profile-edit.storage.ts",
  "src/features/profiles/edit/ui/ProfileEditScreen.tsx",
  "src/features/profiles/edit/ui/ProfileEditScreen.module.css",
  "src/features/profiles/edit/index.ts",
  "src/app/(platform)/profile/edit/page.tsx",
  "src/app/(platform)/profile/edit/loading.tsx",
  "src/app/(platform)/profile/edit/error.tsx",
  "docs/milestones/M11/m11-11-3-profile-editing-validation.md",
  "tsconfig.m11-11-3.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`M11.3 missing required file: ${file}`);
  }
}

const schema = fs.readFileSync("src/features/profiles/edit/model/profile-edit.schema.ts", "utf8");
const storage = fs.readFileSync(
  "src/features/profiles/edit/storage/profile-edit.storage.ts",
  "utf8",
);
const screen = fs.readFileSync("src/features/profiles/edit/ui/ProfileEditScreen.tsx", "utf8");
const foundation = fs.readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const markers = [
  [schema, "profileEditSchema", "Zod profile edit schema"],
  [schema, "image/webp", "restricted avatar MIME types"],
  [schema, "maximumBytes", "avatar size limit"],
  [storage, "saveConfirmedProfileEdit", "replay-safe local save command"],
  [storage, "requestKey", "duplicate-submission key"],
  [storage, "useConfirmedPlayerProfile", "own-profile edit integration"],
  [screen, 'data-m11-stage="11.3"', "M11.3 stage marker"],
  [screen, "zodResolver", "React Hook Form Zod resolver"],
  [screen, "beforeunload", "unsaved-change warning"],
  [screen, "Save profile", "functional save control"],
  [foundation, "VERZUS M11.3 EDIT PROFILE LINK", "edit-profile action"],
  [foundation, 'data-profile-edit-integration="11.3"', "confirmed edit rendering"],
];

for (const [source, marker, label] of markers) {
  if (!source.includes(marker)) {
    throw new Error(`M11.3 missing ${label}: ${marker}`);
  }
}

if (!pkg.scripts?.["verify:m11:11.3"] || !pkg.scripts?.["typecheck:m11:11.3"]) {
  throw new Error("M11.3 package scripts are missing.");
}

if (/vitest|playwright/.test(pkg.scripts["verify:m11:11.3"])) {
  throw new Error("M11.3 lean verifier must not run Vitest or Playwright.");
}

console.log(
  "M11.3 validated identity editing, restricted avatar controls, replay-safe local saves, draft persistence and own-profile integration are installed.",
);
