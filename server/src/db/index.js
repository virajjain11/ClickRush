import { pool } from "./pool.js";

export { pool };

export async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Runs `callback` against a single client inside a transaction, committing on
 * success and rolling back on any throw. The callback receives the client, so
 * every statement in the transaction must go through it — a `query()` call
 * inside the callback would take a different connection and land outside the
 * transaction.
 */
export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");

    return result;
  } catch (error) {
    // A rollback on an already-broken connection throws again; the original
    // error is the one worth surfacing.
    await client.query("ROLLBACK").catch(() => {});

    throw error;
  } finally {
    client.release();
  }
}
