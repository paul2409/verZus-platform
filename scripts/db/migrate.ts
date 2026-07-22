import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Add it to .env.local before running migrations.");
}

const sslMode = process.env.DATABASE_SSL_MODE ?? "disable";
const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    sslMode === "disable"
      ? undefined
      : {
          rejectUnauthorized: sslMode === "verify-full",
        },
});

const migrationsDirectory = path.join(process.cwd(), "database", "migrations");
const advisoryLockKey = 918_274_611;

function checksum(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

async function migrate(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [advisoryLockKey]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        checksum char(64) NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const migrationNames = (await readdir(migrationsDirectory))
      .filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/u.test(name))
      .sort();

    for (const name of migrationNames) {
      const contents = await readFile(path.join(migrationsDirectory, name), "utf8");
      const expectedChecksum = checksum(contents);
      const existing = await client.query<{ checksum: string }>(
        "SELECT checksum FROM schema_migrations WHERE name = $1",
        [name],
      );

      if (existing.rowCount === 1) {
        if (existing.rows[0]?.checksum !== expectedChecksum) {
          throw new Error(`Applied migration ${name} was modified after deployment.`);
        }

        console.log(`already applied: ${name}`);
        continue;
      }

      await client.query("BEGIN");

      try {
        await client.query(contents);
        await client.query(
          "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
          [name, expectedChecksum],
        );
        await client.query("COMMIT");
        console.log(`applied: ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [advisoryLockKey]).catch(() => undefined);
    client.release();
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
