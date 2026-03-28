import { type SQLiteDatabase } from "expo-sqlite";

// ---------------------------------------------------------------------------
// Schema migrations
// Each migration is identified by its version number (1-indexed).
// runMigrations() applies any missing migrations in order — idempotent.
// ---------------------------------------------------------------------------

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS child_profiles (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        age         INTEGER,
        condition   TEXT NOT NULL,
        notes       TEXT,
        is_active   INTEGER NOT NULL DEFAULT 1,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS day_plans (
        id          TEXT PRIMARY KEY,
        date        TEXT NOT NULL UNIQUE,
        topic       TEXT,
        raw_json    TEXT NOT NULL,
        created_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pending_tasks (
        id          TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        priority    TEXT NOT NULL DEFAULT 'normal',
        is_done     INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS schema_migrations (
        version     INTEGER PRIMARY KEY,
        applied_at  TEXT NOT NULL
      );
    `,
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Ensure the migrations tracking table exists first
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations ORDER BY version ASC",
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) continue;

    await db.execAsync(migration.sql);
    await db.runAsync(
      "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
      [migration.version, new Date().toISOString()],
    );
  }
}

// ---------------------------------------------------------------------------
// Seed helper — inserts default pending tasks on first launch
// ---------------------------------------------------------------------------

export async function seedInitialData(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM pending_tasks",
  );
  if (existing && existing.cnt > 0) return; // already seeded

  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pending_tasks (id, description, priority, is_done, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    ["task-1", "Finalize sensory play materials for Thursday", "urgent", now],
  );
  await db.runAsync(
    `INSERT INTO pending_tasks (id, description, priority, is_done, created_at)
     VALUES (?, ?, ?, 0, ?)`,
    ["task-2", "Log afternoon snacks for Blue Group", "normal", now],
  );
}
