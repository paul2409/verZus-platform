// VERZUS M12.2 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/search/resources/model/search-resource.types.ts",
  "src/features/search/resources/schema/search-resource.schema.ts",
  "src/features/search/resources/adapter/search-resource.adapter.ts",
  "src/features/search/resources/api/search-resource.client.ts",
  "src/features/search/resources/api/search-resource.query.ts",
  "src/features/search/resources/hooks/useSearchResources.ts",
  "src/features/search/resources/server/search-resource.service.ts",
  "src/features/search/resources/server/search-resource.http.ts",
  "src/features/search/resources/server/index.ts",
  "src/features/search/resources/index.ts",
  "src/app/api/search/players/route.ts",
  "src/app/api/search/crews/route.ts",
  "src/app/api/search/competitions/route.ts",
  "src/app/api/search/matches/route.ts",
  "docs/milestones/M12/m12-12-2-debounced-search-domain-resources.md",
  "tsconfig.m12-12-2.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.2 missing required file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/search/foundation/ui/SearchFoundationScreen.tsx",
  "utf8",
);
const client = fs.readFileSync(
  "src/features/search/resources/api/search-resource.client.ts",
  "utf8",
);
const query = fs.readFileSync(
  "src/features/search/resources/api/search-resource.query.ts",
  "utf8",
);
const hook = fs.readFileSync(
  "src/features/search/resources/hooks/useSearchResources.ts",
  "utf8",
);
const schema = fs.readFileSync(
  "src/features/search/resources/schema/search-resource.schema.ts",
  "utf8",
);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const marker of [
  'data-m12-stage="12.2"',
  "useDebouncedValue",
  "300",
  "Live suggestions",
  "Partial results",
  "useSearchResources",
]) {
  if (!screen.includes(marker)) throw new Error(`M12.2 screen marker missing: ${marker}`);
}

for (const marker of ["signal", "AbortError", "/api/search/"]) {
  if (!client.includes(marker)) throw new Error(`M12.2 client marker missing: ${marker}`);
}

for (const marker of ["placeholderData: keepPreviousData", "retry: false", "queryKey"]) {
  if (!query.includes(marker)) throw new Error(`M12.2 query marker missing: ${marker}`);
}

for (const marker of ["players", "crews", "competitions", "matches", "hasFailure"]) {
  if (!hook.includes(marker)) throw new Error(`M12.2 hook marker missing: ${marker}`);
}

if (!schema.includes("searchResourceResponseSchema")) {
  throw new Error("M12.2 Zod response schema is missing.");
}

for (const scriptName of ["m12:preview", "typecheck:m12:12.2", "verify:m12:12.2"]) {
  if (!packageJson.scripts?.[scriptName]) throw new Error(`M12.2 package script missing: ${scriptName}`);
}

console.log(
  "M12.2 debounced suggestions, abortable domain queries, schema validation and partial-domain failure isolation are installed.",
);
