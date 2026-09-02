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

const tables = [
  "nix_tasks",
  "nix_projects",
  "nix_accounts",
  "nix_transactions",
  "nix_habits",
  "nix_medications",
  "nix_health_measurements",
  "nix_focus_sessions",
  "nix_goals",
  "nix_notes",
];

try {
  for (const table of tables) {
    await pool.query(
      `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`
    );

    console.log(`RLS enabled: ${table}`);
  }

  console.log("");
  console.log("Database hardening completed successfully.");
} finally {
  await pool.end();
}
