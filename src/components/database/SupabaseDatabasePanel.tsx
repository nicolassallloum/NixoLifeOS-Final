import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Server,
  KeyRound,
  Globe,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { NixCard } from "../ui/NixUi";
import {
  SUPABASE_CONFIG,
  SUPABASE_SQL_SCHEMA,
  supabaseDbService,
  DatabaseStatus,
} from "../../lib/supabase";

export const SupabaseDatabasePanel: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "cli" | "sql">("overview");

  const checkStatus = async () => {
    setLoading(true);
    try {
      const s = await supabaseDbService.checkConnection();
      setStatus(s);
    } catch (err: any) {
      setStatus({
        connected: false,
        mode: "offline_local",
        projectRef: SUPABASE_CONFIG.projectRef,
        url: SUPABASE_CONFIG.url,
        tablesCount: 0,
        tables: [],
        message: err.message || "Failed to query database status",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleInitSchema = async () => {
    setActionLoading("init-schema");
    setFeedback(null);
    try {
      const res = await supabaseDbService.initSchema();
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        checkStatus();
      } else {
        setFeedback({
          type: "info",
          message: res.message + " You can also run the provided SQL migration in the Supabase SQL Editor tab.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncToCloud = async () => {
    setActionLoading("sync");
    setFeedback(null);
    try {
      const res = await supabaseDbService.pushAllToCloud();
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Synced ${res.syncedCount} records to Supabase PostgreSQL!`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePullFromCloud = async () => {
    setActionLoading("pull");
    setFeedback(null);
    try {
      const res = await supabaseDbService.pullAllFromCloud();
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "info", message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const cliCommands = `# 1. Authenticate with Supabase CLI
supabase login

# 2. Initialize local Supabase project structure
supabase init

# 3. Link this local project to your Supabase project
supabase link --project-ref aewqatcsrmhznhgdhboa

# 4. Pull remote database schema
supabase db pull

# 5. Push migrations or test functions
supabase db push`;

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100">Supabase & PostgreSQL Cloud Integration</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] uppercase tracking-wider font-bold">
                Project: {SUPABASE_CONFIG.projectRef}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cloud persistence and relational synchronization engine connected to Supabase PostgreSQL database instance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            title="Refresh database connection status"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Checking..." : "Test Connection"}</span>
          </button>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : feedback.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : feedback.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Connection & Cloud Sync</span>
        </button>

        <button
          onClick={() => setActiveTab("cli")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "cli"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Supabase CLI Link</span>
        </button>

        <button
          onClick={() => setActiveTab("sql")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "sql"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>PostgreSQL SQL Schema (DDL)</span>
        </button>
      </div>

      {/* Tab 1: Overview & Sync */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Connection Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NixCard className="bg-slate-950 border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Supabase Project URL</span>
              <div className="text-xs text-slate-200 font-mono break-all flex items-center justify-between gap-2">
                <span>{SUPABASE_CONFIG.url}</span>
                <button
                  onClick={() => handleCopy(SUPABASE_CONFIG.url, "url")}
                  className="p-1 text-slate-400 hover:text-cyan-300"
                  title="Copy URL"
                >
                  {copiedSection === "url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <Globe className="w-3 h-3" /> Project ID: {SUPABASE_CONFIG.projectRef}
              </div>
            </NixCard>

            <NixCard className="bg-slate-950 border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Publishable API Key</span>
              <div className="text-xs text-slate-200 font-mono flex items-center justify-between gap-2">
                <span className="truncate">{SUPABASE_CONFIG.anonKey.slice(0, 16)}...{SUPABASE_CONFIG.anonKey.slice(-6)}</span>
                <button
                  onClick={() => handleCopy(SUPABASE_CONFIG.anonKey, "key")}
                  className="p-1 text-slate-400 hover:text-cyan-300"
                  title="Copy Key"
                >
                  {copiedSection === "key" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1.5 pt-1">
                <KeyRound className="w-3 h-3" /> Browser Client Key Configured
              </div>
            </NixCard>

            <NixCard className="bg-slate-950 border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Direct PostgreSQL Host</span>
              <div className="text-xs text-slate-200 font-mono flex items-center justify-between gap-2">
                <span>db.{SUPABASE_CONFIG.projectRef}.supabase.co:5432</span>
                <button
                  onClick={() => handleCopy(SUPABASE_CONFIG.directConnectionStringTemplate, "pguri")}
                  className="p-1 text-slate-400 hover:text-cyan-300"
                  title="Copy Connection String Template"
                >
                  {copiedSection === "pguri" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-[11px] text-indigo-400 flex items-center gap-1.5 pt-1">
                <HardDrive className="w-3 h-3" /> Database: postgres (Port 5432)
              </div>
            </NixCard>
          </div>

          {/* Sync Operations Card */}
          <NixCard className="bg-slate-950 border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Database Table Synchronizer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronize your life tasks, transactions, habits, vitals, and projects with your Supabase database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInitSchema}
                  disabled={!!actionLoading}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{actionLoading === "init-schema" ? "Provisioning..." : "Auto-Init Tables"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Push Local OS to Cloud
                  </div>
                  <span className="text-[10px] text-slate-400">Local → Supabase</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Uploads all your locally stored tasks, transactions, accounts, and health logs to your Supabase PostgreSQL tables.
                </p>
                <button
                  onClick={handleSyncToCloud}
                  disabled={!!actionLoading}
                  className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{actionLoading === "sync" ? "Uploading to Cloud..." : "Sync All to Supabase"}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-cyan-400" /> Pull Cloud Records
                  </div>
                  <span className="text-[10px] text-slate-400">Supabase → Local</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fetches remote PostgreSQL records and merges them into your active browser session state.
                </p>
                <button
                  onClick={handlePullFromCloud}
                  disabled={!!actionLoading}
                  className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{actionLoading === "pull" ? "Fetching Records..." : "Pull from Supabase"}</span>
                </button>
              </div>
            </div>
          </NixCard>
        </div>
      )}

      {/* Tab 2: Supabase CLI Guide */}
      {activeTab === "cli" && (
        <NixCard className="bg-slate-950 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Supabase CLI Quick-Link Guide
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Run these commands in your terminal to link your repository to project{" "}
                <code className="text-cyan-300 font-mono">aewqatcsrmhznhgdhboa</code>.
              </p>
            </div>
            <button
              onClick={() => handleCopy(cliCommands, "cli-all")}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedSection === "cli-all" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy All Commands
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto space-y-3 leading-relaxed">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
              <span>BASH TERMINAL SEQUENCE</span>
              <span>PROJECT REF: {SUPABASE_CONFIG.projectRef}</span>
            </div>
            <pre className="text-cyan-300 whitespace-pre-wrap">{cliCommands}</pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200 block mb-1">Direct Connection String</strong>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] text-cyan-400 break-all select-all">
                postgresql://postgres:[YOUR-PASSWORD]@db.aewqatcsrmhznhgdhboa.supabase.co:5432/postgres
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200 block mb-1">Supabase Dashboard SQL Editor</strong>
              <p className="text-[11px] text-slate-400">
                You can paste the DDL schema directly into the SQL Editor at:{" "}
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectRef}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  supabase.com/dashboard/project/{SUPABASE_CONFIG.projectRef}/sql
                </a>
              </p>
            </div>
          </div>
        </NixCard>
      )}

      {/* Tab 3: SQL Schema Migration */}
      {activeTab === "sql" && (
        <NixCard className="bg-slate-950 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" /> Complete PostgreSQL DDL Migration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready to execute in the Supabase Dashboard SQL Editor or via CLI migrations.
              </p>
            </div>
            <button
              onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, "sql-schema")}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedSection === "sql-schema" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied SQL!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL DDL
                </>
              )}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300 leading-relaxed">
            <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
          </div>
        </NixCard>
      )}
    </div>
  );
};
