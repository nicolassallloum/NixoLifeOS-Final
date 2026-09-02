import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.nix_cloud_snapshots (
      user_id TEXT NOT NULL,
      collection_key TEXT NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, collection_key)
    );

    CREATE INDEX IF NOT EXISTS idx_nix_cloud_snapshots_user
      ON public.nix_cloud_snapshots(user_id);

    ALTER TABLE public.nix_cloud_snapshots
      ENABLE ROW LEVEL SECURITY;
  `);

  console.log("nix_cloud_snapshots created successfully.");
  console.log("RLS enabled.");
} finally {
  await pool.end();
}
