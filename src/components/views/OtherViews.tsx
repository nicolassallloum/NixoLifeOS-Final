import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Target,
  Repeat,
  Calendar as CalendarIcon,
  Timer,
  GraduationCap,
  Briefcase,
  FileText,
  FolderOpen,
  BarChart3,
  Trophy,
  SlidersHorizontal,
  Wifi,
  History,
  Trash2,
  Settings as SettingsIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Shield,
  Download,
  User as UserIcon,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Save,
  Plus,
  Bell,
  TrendingUp,
  Sparkles,
  CheckSquare,
  FilePlus,
  RefreshCw,
} from "lucide-react";

import { nixStorage } from "../../lib/storage";
import { NixCard, NixProgressBar, NixStatusBadge, NixPriorityBadge } from "../ui/NixUi";
import { SupabaseDatabasePanel } from "../database/SupabaseDatabasePanel";

export { ProjectsView } from "./ProjectsView";

export { GoalsView } from "./GoalsView";
export { HabitsView } from "./HabitsView";

export { CalendarView } from "./CalendarView";
export { FocusView } from "./FocusView";

export { EducationView } from "./EducationView";
export { CareerView } from "./CareerView";

export { NotesView } from "./NotesView";
export { DocumentsView } from "./DocumentsView";
export { PointsRewardsView } from "./PointsView";
export { AuditView } from "./AuditView";

// Settings View
export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "database" | "maintenance">("database");
  const [user, setUser] = useState(() => nixStorage.getCurrentUser());
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    displayName: user?.displayName || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "United States",
    timezone: user?.timezone || "UTC-05:00 (EST)",
    preferredLanguage: user?.preferredLanguage || "English (US)",
    productUpdateConsent: user?.productUpdateConsent ?? true,
    marketingConsent: user?.marketingConsent ?? false,
    analyticsConsent: user?.analyticsConsent ?? true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = nixStorage.updateUserProfile(user.id, formData);
    if (updated) {
      setUser(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-extrabold flex items-center gap-2 text-cyan-400">
            <SettingsIcon className="w-5 h-5 text-cyan-400" /> LIFE OS SETTINGS & CONFIGURATION
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage your registered account, Supabase PostgreSQL database integration, security consents, and system data.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab("database")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "database"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Cloud DB</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>User Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "maintenance"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Maintenance</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Account profile updated successfully!
        </div>
      )}

      {/* Tab: Supabase Database Integration */}
      {activeTab === "database" && <SupabaseDatabasePanel />}

      {/* Tab: User Profile */}
      {activeTab === "profile" && (
        <NixCard className="space-y-6 bg-slate-950 border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={user?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                alt="Profile"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-md"
              />
              <div>
                <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                  {user?.displayName || `${user?.firstName} ${user?.lastName}`}
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-[10px] uppercase">
                    Registered Account
                  </span>
                </h3>
                <p className="text-xs font-mono text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              {editing ? "Cancel Editing" : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Display Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Country / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Time Zone *</label>
                  <input
                    type="text"
                    required
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Preferred Language *</label>
                  <input
                    type="text"
                    required
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Communication Consents:</div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.productUpdateConsent}
                    onChange={(e) => setFormData({ ...formData, productUpdateConsent: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  Product Update Consent
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  Marketing Consent
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.analyticsConsent}
                    onChange={(e) => setFormData({ ...formData, analyticsConsent: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                  />
                  Analytics Telemetry Consent
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Primary Contact</span>
                <div className="text-slate-200 font-bold mt-0.5">{user?.firstName} {user?.lastName}</div>
                <div className="text-slate-400 text-[11px]">{user?.email}</div>
                <div className="text-slate-400 text-[11px] mt-1">{user?.phoneNumber || "No phone added"}</div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Location & Language</span>
                <div className="text-cyan-300 font-bold mt-0.5">{user?.country}</div>
                <div className="text-slate-300 text-[11px]">{user?.timezone}</div>
                <div className="text-slate-400 text-[11px]">{user?.preferredLanguage}</div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Codes & Invites</span>
                <div className="text-slate-300 text-[11px]">Referral: <strong className="text-amber-400">{user?.referralCode || "N/A"}</strong></div>
                <div className="text-slate-300 text-[11px]">Invitation: <strong className="text-indigo-400">{user?.invitationCode || "N/A"}</strong></div>
                <div className="text-slate-500 text-[10px] mt-1">Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026-07-29"}</div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1 text-slate-300 text-[11px]">
                <div className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Account Consents & Policy Registrations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Age Confirmation Accepted
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terms of Service Accepted
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Privacy Policy Accepted
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-slate-400 text-[10px]">
                  <span>Product Updates: <strong className={user?.productUpdateConsent ? "text-emerald-400" : "text-slate-500"}>{user?.productUpdateConsent ? "YES" : "NO"}</strong></span>
                  <span>Marketing Communications: <strong className={user?.marketingConsent ? "text-emerald-400" : "text-slate-500"}>{user?.marketingConsent ? "YES" : "NO"}</strong></span>
                  <span>Analytics Telemetry: <strong className={user?.analyticsConsent ? "text-emerald-400" : "text-slate-500"}>{user?.analyticsConsent ? "YES" : "NO"}</strong></span>
                </div>
              </div>
            </div>
          )}
        </NixCard>
      )}

      {/* Tab: Maintenance */}
      {activeTab === "maintenance" && (
        <NixCard className="space-y-4 bg-slate-950 border-slate-800">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono font-bold text-slate-100">Reset System Data</div>
              <div className="text-[11px] font-mono text-slate-400">Clear all tasks, transactions, habits and reset system to clean state.</div>
            </div>
            <button
              onClick={() => {
                nixStorage.resetToDemoData();
                setUser(nixStorage.getCurrentUser());
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold shadow-sm"
            >
              Reset All Data
            </button>
          </div>
        </NixCard>
      )}
    </div>
  );
};

// Reports View
export const ReportsView: React.FC = () => {
  const tasks = nixStorage.getTasks();
  const transactions = nixStorage.getTransactions();
  const habits = nixStorage.getHabits();

  const completedTasks = tasks.filter((t) => t.status === "Finished").length;
  const income = transactions.filter((t) => t.category === "Income" || t.amount > 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const expense = transactions.filter((t) => t.category === "Expense" || t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-slate-100 shadow-xl">
        <h1 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Executive Telemetry & Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">Analytical breakdowns of task velocity, cashflows, and habits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NixCard className="bg-slate-950 border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Tasks Completed</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{completedTasks} / {tasks.length}</div>
        </NixCard>
        <NixCard className="bg-slate-950 border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Net Income Flow</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">+${(income - expense).toLocaleString()}</div>
        </NixCard>
        <NixCard className="bg-slate-950 border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Active Habits</span>
          <div className="text-2xl font-bold text-teal-400 mt-1">{habits.length}</div>
        </NixCard>
      </div>
    </div>
  );
};

// Automations View
export const AutomationsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-slate-100 shadow-xl">
        <h1 className="text-xl font-bold text-violet-400 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-violet-400" /> Life OS Automation Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure event-driven triggers, notifications, and rule chains.</p>
      </div>

      <NixCard className="text-center py-12 text-slate-500 text-xs bg-slate-950 border-slate-800">
        System automation rules active. All background sync and level-up triggers are operational.
      </NixCard>
    </div>
  );
};

// Recycle Bin View
export const RecycleBinView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-slate-100 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-rose-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" /> System Recycle Bin
          </h1>
          <p className="text-xs text-slate-400 mt-1">Restore soft-deleted items or empty bin permanently.</p>
        </div>
      </div>

      <NixCard className="text-center py-12 text-slate-500 text-xs bg-slate-950 border-slate-800">
        Recycle Bin is currently empty. Deleted tasks, notes, or entries will appear here for recovery.
      </NixCard>
    </div>
  );
};

// Notifications View
export const NotificationsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 text-slate-100 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" /> System Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">All real-time telemetry alerts, reminders, and milestones.</p>
        </div>
      </div>

      <NixCard className="text-center py-12 text-slate-500 text-xs bg-slate-950 border-slate-800">
        No unread system notifications at this time.
      </NixCard>
    </div>
  );
};

