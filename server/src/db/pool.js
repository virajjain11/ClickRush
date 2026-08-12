import pg from "pg";
import { env, isProduction } from "../config/env.js";

// One pool for the whole process, created at module load. Creating a pool per
// request would open a new connection every time and exhaust the server.
export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: isProduction ? { rejectUnauthorized: true } : false,
});

// A pooled client sitting idle can still be dropped by the database or the
// network. Without a listener that arrives as an unhandled 'error' event, which
// takes the process down.
pool.on("error", (error) => {
  console.error("[db] idle client error", error);
});
