import { createClient } from "@supabase/supabase-js";
import { nixStorage } from "./storage";

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

-- Allow anonymous access for applet synchronization (or authenticated users)
CREATE POLICY "Allow public read-write for nix_tasks" ON nix_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_projects" ON nix_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_accounts" ON nix_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_transactions" ON nix_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_habits" ON nix_habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_medications" ON nix_medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_health_measurements" ON nix_health_measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_focus_sessions" ON nix_focus_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_goals" ON nix_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nix_notes" ON nix_notes FOR ALL USING (true) WITH CHECK (true);
`;

export const supabaseDbService = {
  // Test connection to Supabase / Postgres via server API
  async checkConnection(): Promise<DatabaseStatus> {
    try {
      const res = await fetch("/api/db/status");
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

  // Push local storage data to Supabase
  async pushAllToCloud(): Promise<{ success: boolean; message: string; syncedCount: number }> {
    try {
      const payload = {
        tasks: nixStorage.getTasks(),
        projects: nixStorage.getProjects(),
        accounts: nixStorage.getAccounts(),
        transactions: nixStorage.getTransactions(),
        habits: nixStorage.getHabits(),
        medications: nixStorage.getMedications(),
        healthMeasurements: nixStorage.getHealthMeasurements(),
        focusSessions: nixStorage.getFocusSessions(),
        goals: nixStorage.getGoals(),
        notes: nixStorage.getNotes(),
      };

      const res = await fetch("/api/db/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to push data to Supabase.",
        syncedCount: 0,
      };
    }
  },

  // Pull cloud data into local storage
  async pullAllFromCloud(): Promise<{ success: boolean; message: string; recordsLoaded: number }> {
    try {
      const res = await fetch("/api/db/pull");
      const data = await res.json();
      if (data.success && data.data) {
        let count = 0;
        // Optionally merge or restore data
        if (data.data.tasks && Array.isArray(data.data.tasks)) {
          data.data.tasks.forEach((t: any) => nixStorage.saveTask(t));
          count += data.data.tasks.length;
        }
        if (data.data.projects && Array.isArray(data.data.projects)) {
          data.data.projects.forEach((p: any) => nixStorage.saveProject(p));
          count += data.data.projects.length;
        }
        if (data.data.transactions && Array.isArray(data.data.transactions)) {
          data.data.transactions.forEach((tx: any) => nixStorage.saveTransaction(tx));
          count += data.data.transactions.length;
        }
        return {
          success: true,
          message: `Successfully pulled ${count} records from Supabase PostgreSQL.`,
          recordsLoaded: count,
        };
      }
      return {
        success: false,
        message: data.message || "No data received from cloud.",
        recordsLoaded: 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to pull data from Supabase.",
        recordsLoaded: 0,
      };
    }
  },
};
