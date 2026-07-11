import { existsSync } from "node:fs";
import process from "node:process";
import dotenv from "dotenv";

async function main() {
  const requestedPath = process.argv[2];
  const envPath = requestedPath ?? ".env.local";

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }

  const { parsePublicEnv, parseServerEnv } = await import("../src/lib/config/env.schema");

  try {
    const publicEnv = parsePublicEnv(process.env);
    parseServerEnv(process.env);

    console.log(
      [
        "Environment validation passed.",
        `Application environment: ${publicEnv.appEnv}`,
        `API base URL: ${publicEnv.apiBaseUrl}`,
        `Mocks enabled: ${String(publicEnv.enableMocks)}`,
        `Release: ${publicEnv.releaseSha}`,
      ].join("\n"),
    );
  } catch (error) {
    console.error("Environment validation failed.");
    console.error(error);
    process.exit(1);
  }
}

void main();
