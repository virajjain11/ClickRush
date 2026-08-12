import { readdir, readFile } from "node:fs/promises";
import { pool } from "../src/db/pool.js";

const migrationsUrl = new URL("../migrations/", import.meta.url);

// Arbitrary, but every run must use the same key for the lock to mean anything.
const ADVISORY_LOCK_KEY = 4919181;

async function readMigrationFilenames() {
  try {
    const entries = await readdir(migrationsUrl);

    // Filename order is the migration order, which is why files are numbered.
    return entries.filter((entry) => entry.endsWith(".sql")).sort();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function applyMigration(client, filename) {
  const sql = await readFile(new URL(filename, migrationsUrl), "utf8");

  // One transaction per file, so a failure part way through a run leaves the
  // files before it applied and recorded rather than rolling everything back.
  await client.query("BEGIN");

  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      filename,
    ]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    throw new Error(`Failed to apply ${filename}: ${error.message}`, {
      cause: error,
    });
  }
}

async function migrate() {
  const client = await pool.connect();

  try {
    // Session-level lock held for the whole run, so two migrate processes
    // cannot apply the same file twice. Released with the connection.
    await client.query("SELECT pg_advisory_lock($1::bigint)", [
      ADVISORY_LOCK_KEY,
    ]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   text        PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query(
      "SELECT filename FROM schema_migrations",
    );
    const appliedFilenames = new Set(rows.map((row) => row.filename));
    const filenames = await readMigrationFilenames();
    const pendingFilenames = filenames.filter(
      (filename) => !appliedFilenames.has(filename),
    );

    if (pendingFilenames.length === 0) {
      console.log("[migrate] up to date, nothing to apply");
      return;
    }

    for (const filename of pendingFilenames) {
      await applyMigration(client, filename);
      console.log(`[migrate] applied ${filename}`);
    }
  } finally {
    client.release();
  }
}

try {
  await migrate();
} catch (error) {
  console.error("[migrate] failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
