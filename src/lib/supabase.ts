import { createClient } from "@supabase/supabase-js";
import { STORAGE_KEYS } from "./storage";

export const SUPABASE_CONFIG = {
  projectRef: "aewqatcsrmhznhgdhboa",
  url: (import.meta as any).env?.VITE_SUPABASE_URL || "https://aewqatcsrmhznhgdhboa.supabase.co",
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_erKtqGktxnlUavZFF3f9Fg_LwMso_Zj",
  directConnectionHost: "db.aewqatcsrmhznhgdhboa.supabase.co",
  directPort: 5432,
  database: "postgres",
  user: "postgres",
  directConnectionStringTemplate: "postgresql://postgres:[YOUR-PASSWORD]@db.aewqatcsrmhznhgdhboa.supabase.co:5432/postgres",
};

// Client-side Supabase client instance
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export interface DatabaseStatus {
  connected: boolean;
  mode: "supabase_rest" | "direct_postgres" | "offline_local";
  projectRef: string;
  url: string;
  tablesCount: number;
  tables: string[];
  latencyMs?: number;
  message: string;
  details?: Record<string, any>;
}

// Complete PostgreSQL schema DDL for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- NIX LIFE OS - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Project: aewqatcsrmhznhgdhboa
-- Generated for Nix Life OS Command Center
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS nix_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'Daily',
    status TEXT DEFAULT 'Planned',
    priority TEXT DEFAULT 'Medium',
    due_date DATE,
    estimated_minutes INT DEFAULT 30,
    actual_minutes INT DEFAULT 0,
    project_id TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    points INT DEFAULT 20,
    progress INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS nix_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Planned',
    due_date DATE,
    category TEXT DEFAULT 'General',
    progress INT DEFAULT 0,
    color TEXT DEFAULT '#06B6D4',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Finance Accounts Table
CREATE TABLE IF NOT EXISTS nix_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    account_type TEXT DEFAULT 'Checking',
    balance NUMERIC(12, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions Table (Expenses & Incomes)
CREATE TABLE IF NOT EXISTS nix_transactions (
    id TEXT PRIMARY KEY,
    transaction_type TEXT NOT NULL, -- 'Expense' | 'Income' | 'Transfer'
    title TEXT NOT NULL,
    merchant TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    account_id TEXT,
    category_id TEXT,
    transaction_date DATE NOT NULL,
    transaction_time TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habits Table
CREATE TABLE IF NOT EXISTS nix_habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Productivity',
    frequency_type TEXT DEFAULT 'Daily',
    target_quantity INT DEFAULT 1,
    unit TEXT DEFAULT 'times',
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    status TEXT DEFAULT 'Active',
    checkin_history JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Health & Medications Table
CREATE TABLE IF NOT EXISTS nix_medications (
    id TEXT PRIMARY KEY,
    medication_name TEXT NOT NULL,
    dosage_value TEXT,
    dosage_unit TEXT DEFAULT 'Tablet',
    frequency_type TEXT DEFAULT 'Once daily',
    refill_quantity INT DEFAULT 30,
    refill_threshold INT DEFAULT 5,
    schedule_times JSONB DEFAULT '[]'::jsonb,
    logs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Health Measurements (Vitals)
CREATE TABLE IF NOT EXISTS nix_health_measurements (
    id TEXT PRIMARY KEY,
    measure_type TEXT NOT NULL,
    primary_value NUMERIC(10, 2) NOT NULL,
    secondary_value NUMERIC(10, 2),
    unit TEXT,
    measured_date DATE NOT NULL,
    measured_time TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Focus Sessions (Pomodoros)
CREATE TABLE IF NOT EXISTS nix_focus_sessions (
    id TEXT PRIMARY KEY,
    planned_minutes INT NOT NULL,
    actual_minutes INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Completed',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Goals Table
CREATE TABLE IF NOT EXISTS nix_goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Personal',
    target_value NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0,
    unit TEXT,
    due_date DATE,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notes & Knowledge Base
CREATE TABLE IF NOT EXISTS nix_notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    folder TEXT DEFAULT 'General',
    tags JSONB DEFAULT '[]'::jsonb,
    priority TEXT DEFAULT 'Medium',
    pinned BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE nix_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_health_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nix_notes ENABLE ROW LEVEL SECURITY;

-- SECURITY
-- RLS is enabled.
-- No anonymous public read/write policies are created.
-- Cloud synchronization is performed through the Express backend.
`;

export const supabaseDbService = {
  // Test connection to Supabase / Postgres via server API
  async checkConnection(): Promise<DatabaseStatus> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return {
          connected: false,
          mode: "offline_local",
          projectRef: SUPABASE_CONFIG.projectRef,
          url: SUPABASE_CONFIG.url,
          tablesCount: 0,
          tables: [],
          message:
            "Sign in to check the cloud database connection.",
        };
      }

      const res = await fetch("/api/db/status", {
        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      // Fallback local status check
      return {
        connected: false,
        mode: "offline_local",
        projectRef: SUPABASE_CONFIG.projectRef,
        url: SUPABASE_CONFIG.url,
        tablesCount: 0,
        tables: [],
        message: err.message || "Could not reach server database endpoint.",
      };
    }
  },

  // Initialize schema on Supabase
  async initSchema(): Promise<{ success: boolean; message: string; tablesCreated?: string[] }> {
    try {
      const res = await fetch("/api/db/init-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to initialize schema.",
      };
    }
  },

  // V2: Push every Nix Life OS local-storage collection
  async pushAllToCloud(): Promise<{
    success: boolean;
    message: string;
    syncedCount: number;
  }> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return {
          success: false,
          message:
            "You must be signed in before synchronizing cloud data.",
          syncedCount: 0,
        };
      }

      const collections: Record<string, unknown> = {};

      for (const key of Object.values(STORAGE_KEYS)) {
        const raw = localStorage.getItem(key);

        if (raw === null) {
          continue;
        }

        try {
          collections[key] = JSON.parse(raw);
        } catch {
          collections[key] = raw;
        }
      }

      const res = await fetch("/api/db/sync-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          collections,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message:
            data.message ||
            "Failed to synchronize Nix Life OS cloud snapshot.",
          syncedCount: 0,
        };
      }

      return {
        success: true,
        message: data.message,
        syncedCount: data.recordsStored || 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.message ||
          "Failed to push Nix Life OS data to PostgreSQL.",
        syncedCount: 0,
      };
    }
  },

  // V2: Restore every cloud collection back into local storage
  async pullAllFromCloud(): Promise<{
    success: boolean;
    message: string;
    recordsLoaded: number;
  }> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return {
          success: false,
          message:
            "You must be signed in before restoring cloud data.",
          recordsLoaded: 0,
        };
      }

      const res = await fetch(
        "/api/db/pull-v2",
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success || !data.data) {
        return {
          success: false,
          message:
            data.message ||
            "No cloud snapshot was returned.",
          recordsLoaded: 0,
        };
      }

      const allowedKeys = new Set(
        Object.values(STORAGE_KEYS)
      );

      let recordsLoaded = 0;

      for (const [key, value] of Object.entries(data.data)) {
        if (!allowedKeys.has(key)) {
          continue;
        }

        localStorage.setItem(
          key,
          JSON.stringify(value)
        );

        if (Array.isArray(value)) {
          recordsLoaded += value.length;
        } else if (value !== null && value !== undefined) {
          recordsLoaded += 1;
        }
      }

      return {
        success: true,
        message:
          `Restored ${data.collectionsLoaded || 0} cloud collections. ` +
          `Refresh the application to reload restored data.`,
        recordsLoaded,
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.message ||
          "Failed to restore Nix Life OS cloud data.",
        recordsLoaded: 0,
      };
    }
  },

};
