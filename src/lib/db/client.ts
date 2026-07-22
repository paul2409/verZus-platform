import "server-only";

import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg";

import { serverEnv } from "@/lib/config/env.server";

const globalForDatabase = globalThis as typeof globalThis & {
  __verzusDatabasePool?: Pool;
};

function createPoolConfig(): PoolConfig {
  if (!serverEnv.databaseUrl) {
    throw new Error("DATABASE_URL is required before a database connection can be opened.");
  }

  const ssl =
    serverEnv.databaseSslMode === "disable"
      ? undefined
      : {
          rejectUnauthorized: serverEnv.databaseSslMode === "verify-full",
        };

  return {
    connectionString: serverEnv.databaseUrl,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: serverEnv.databasePoolMax,
    ssl,
  };
}

export function getDatabasePool(): Pool {
  if (!globalForDatabase.__verzusDatabasePool) {
    globalForDatabase.__verzusDatabasePool = new Pool(createPoolConfig());
  }

  return globalForDatabase.__verzusDatabasePool;
}

export function queryDatabase<TRow extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
): Promise<QueryResult<TRow>> {
  return getDatabasePool().query<TRow>(text, [...values]);
}
