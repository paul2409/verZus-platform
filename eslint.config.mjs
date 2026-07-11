import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.ts", "tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/*", "@/features/**"],
              message: "Shared components must remain domain-neutral and cannot import features.",
            },
            {
              group: ["@/app", "@/app/*", "@/app/**"],
              message: "Shared components cannot depend on the application routing layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features", "@/features/*", "@/features/**"],
              message: "Platform libraries cannot import feature implementations.",
            },
            {
              group: ["@/components", "@/components/*", "@/components/**"],
              message: "Platform libraries cannot import UI components.",
            },
            {
              group: ["@/app", "@/app/*", "@/app/**"],
              message: "Platform libraries cannot import the application routing layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "scripts/**/*.{js,mjs,ts}",
      "next.config.ts",
      "playwright.config.ts",
      "vitest.config.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  prettierConfig,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "node_modules/**",
    "out/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
