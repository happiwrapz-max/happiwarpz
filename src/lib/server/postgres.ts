import postgres from "postgres";

// Fetch database connection strings from environment
const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";

// Verify if the connection string has real credentials (and not the literal placeholder)
export const isPostgresConfigured = Boolean(
  rawUrl &&
  !rawUrl.includes("[YOUR-PASSWORD]") &&
  !rawUrl.includes("your-password") &&
  rawUrl.startsWith("postgres")
);

let sqlInstance: postgres.Sql | null = null;

if (isPostgresConfigured) {
  try {
    sqlInstance = postgres(rawUrl, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // Transaction pooler (port 6543 / pgbouncer) requires prepare: false
    });
  } catch (err) {
    console.warn("[Postgres] Failed to create postgres instance:", err);
    sqlInstance = null;
  }
}

export const sql = sqlInstance;

/**
 * Executes a health check to verify if Postgres connection is active
 */
export async function testPostgresConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!sqlInstance) {
    return {
      ok: false,
      error: "DATABASE_URL is not configured or still contains [YOUR-PASSWORD] placeholder.",
    };
  }

  try {
    const result = await sqlInstance`SELECT NOW() as current_time`;
    return { ok: Boolean(result && result.length > 0) };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
