import type { PoolClient } from "pg";

import { getDatabasePool } from "./client";

export async function withDatabaseTransaction<TResult>(
  operation: (client: PoolClient) => Promise<TResult>,
): Promise<TResult> {
  const client = await getDatabasePool().connect();

  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
