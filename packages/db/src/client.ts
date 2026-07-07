import mysql from "mysql2/promise";

export type DbConfig = {
  url?: string;
};

export async function createPool(config: DbConfig = {}) {
  const uri = config.url || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not configured. Use .env.local with local-only credentials.");
  }

  return mysql.createPool(uri);
}

export async function checkDatabaseConnection(config: DbConfig = {}) {
  const pool = await createPool(config);
  try {
    await pool.query("SELECT 1 AS ok");
    return { ok: true as const };
  } finally {
    await pool.end();
  }
}
