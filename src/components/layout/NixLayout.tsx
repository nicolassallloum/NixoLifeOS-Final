import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Sun,
  CheckSquare,
  FolderKanban,
  Target,
  Repeat,
  Calendar as CalendarIcon,
  Timer,
  Wallet,
  Activity,
  GraduationCap,
  Briefcase,
  FileText,
  FolderOpen,
  Trophy,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  Search,
  Plus,
  Moon,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  Trash2,
  SlidersHorizontal,
  UserCheck,
  User as UserIcon,
  LogOut,
  Lock,
} from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixModal } from "../ui/NixUi";
import { AuthModal } from "../auth/AuthModal";
import { NixCopilotModal } from "../copilot/NixCopilotModal";
import { User } from "../../types";


export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  category?: string;
}

interface NixAppShellProps {
  currentRoute: string;
  onRouteChange: (routeId: string) => void;
  children: React.ReactNode;
}

export const NixAppShell: React.FC<NixAppShellProps> = ({ currentRoute, onRouteChange, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => nixStorage.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pointsProfile = nixStorage.getPointsProfile();
  const notifications = nixStorage.getNotifications().filter((n) => !n.read);


  // Keyboard shortcut Ctrl+K / Cmd+K for command palette & Ctrl+J / Cmd+J for Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "j" || e.key === "J")) {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems: NavigationItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, category: "Core" },
    { id: "my-day", label: "My Day", icon: <Sun className="w-5 h-5 text-amber-500" />, category: "Core" },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5 text-indigo-500" />, category: "Productivity" },
    { id: "projects", label: "Projects", icon: <FolderKanban className="w-5 h-5 text-blue-500" />, category: "Productivity" },
    { id: "goals", label: "Goals", icon: <Target className="w-5 h-5 text-emerald-500" />, category: "Productivity" },
    { id: "habits", label: "Habits", icon: <Repeat className="w-5 h-5 text-teal-500" />, category: "Productivity" },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon className="w-5 h-5 text-violet-500" />, category: "Productivity" },
    { id: "focus", label: "Focus Timer", icon: <Timer className="w-5 h-5 text-rose-500" />, category: "Productivity" },
    { id: "finance", label: "Finance", icon: <Wallet className="w-5 h-5 text-emerald-600" />, category: "Life OS" },
    { id: "health", label: "Health", icon: <Activity className="w-5 h-5 text-rose-600" />, category: "Life OS" },
    { id: "education", label: "Education", icon: <GraduationCap className="w-5 h-5 text-cyan-600" />, category: "Life OS" },
    { id: "career", label: "Career", icon: <Briefcase className="w-5 h-5 text-sky-600" />, category: "Life OS" },
    { id: "notes", label: "Notes", icon: <FileText className="w-5 h-5 text-amber-600" />, category: "Knowledge" },
    { id: "documents", label: "Documents", icon: <FolderOpen className="w-5 h-5 text-slate-500" />, category: "Knowledge" },
    { id: "reports", label: "Reports & Analytics", icon: <BarChart3 className="w-5 h-5 text-indigo-600" />, category: "Analytics" },
    { id: "points", label: "Points & Rewards", icon: <Trophy className="w-5 h-5 text-amber-500" />, category: "Analytics" },
    { id: "copilot", label: "Nix Copilot AI", icon: <Sparkles className="w-5 h-5 text-violet-500" />, category: "Intelligence" },
    { id: "automations", label: "Automations", icon: <SlidersHorizontal className="w-5 h-5 text-indigo-400" />, category: "System" },
    { id: "audit", label: "Audit History", icon: <History className="w-5 h-5 text-slate-400" />, category: "System" },
    { id: "recycle-bin", label: "Recycle Bin", icon: <Trash2 className="w-5 h-5 text-slate-400" />, category: "System" },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5 text-slate-500" />, category: "System" },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Background Radial Glows & Grid Pattern */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-space-grid opacity-30 pointer-events-none z-0" />

      {/* Top Application Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-colors hidden md:block border border-slate-800"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onRouteChange("dashboard")}>
            <div className="w-9 h-9 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <div className="w-4 h-4 bg-cyan-400 rounded-full blur-[1px]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-cyan-400">NIX LIFE OS</span>
              <span className="block text-[9px] font-mono text-slate-500 tracking-wider uppercase -mt-0.5">
                LOC: DEEP SPACE TERMINAL V4.0.12
              </span>
            </div>
          </div>
        </div>

        {/* Global Search trigger bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-medium transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-500/70" />
              <span className="font-mono text-[11px]">Search modules, tasks, finance or query Nix AI...</span>
            </div>
            <kbd className="bg-slate-900 px-1.5 py-0.5 text-[10px] rounded border border-slate-800 font-mono text-cyan-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Sync Indicator */}
          <button
            onClick={() => onRouteChange("settings")}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 font-mono text-[10px] transition-all cursor-pointer"
            title="Supabase PostgreSQL Connected (Click to view Cloud DB Sync)"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider">SUPABASE CLOUD</span>
          </button>

          {/* Copilot AI Universal Trigger */}
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all cursor-pointer group"
            title="Ask Nix Copilot AI across all modules (⌘J)"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>Copilot AI</span>
            <kbd className="hidden sm:inline-block bg-slate-950/80 px-1.5 py-0.2 rounded text-[9px] text-cyan-400 border border-cyan-500/30">
              ⌘J
            </kbd>
          </button>

          {/* Quick-Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* User Level & Points Badge */}
          <button
            onClick={() => onRouteChange("points")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:border-amber-400 transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            title="View Productivity Points & Rewards"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>LVL {pointsProfile.currentLevel}</span>
            <span className="text-[10px] opacity-75">({pointsProfile.totalPoints} PTS)</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    System Telemetry Logs
                  </h4>
                  <button
                    onClick={() => onRouteChange("notifications")}
                    className="text-[10px] font-mono text-cyan-400 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center font-mono">No unread notifications</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs cursor-pointer hover:border-cyan-500/40 transition-colors"
                        onClick={() => {
                          nixStorage.markNotificationRead(n.id);
                          setNotificationsOpen(false);
                          if (n.module) onRouteChange(n.module);
                        }}
                      >
                        <div className="font-bold text-slate-200">{n.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{n.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account / Profile Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs font-mono shadow-sm"
              title="User Account & Security Profile"
            >
              {currentUser?.profilePhoto ? (
                <img
                  src={currentUser.profilePhoto}
                  alt="User Avatar"
                  className="w-6 h-6 rounded-lg object-cover border border-cyan-400/40"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold text-[10px]">
                  {currentUser && currentUser.firstName ? currentUser.firstName[0] : "U"}
                </div>
              )}
              <span className="hidden xl:inline text-slate-200 font-bold truncate max-w-[110px]">
                {currentUser ? currentUser.displayName || currentUser.firstName || "User" : "Sign In"}
              </span>
            </button>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <img
                        src={currentUser.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
                        alt="Profile"
                        className="w-10 h-10 rounded-xl object-cover border border-cyan-400/50"
                      />
                      <div className="overflow-hidden">
                        <div className="font-mono font-bold text-xs text-cyan-300 truncate">
                          {currentUser.displayName || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "User"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email || ""}</div>
                        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase mt-0.5">
                          {currentUser.country || "Global"} • {currentUser.preferredLanguage || "English"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onRouteChange("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-cyan-400" /> Account & Profile Settings
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthModalMode("register");
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-400" /> Register New Account
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-slate-900 hover:text-cyan-300 transition-colors flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-amber-400" /> Switch Account / Login
                      </button>

                      <button
                        onClick={() => {
                          nixStorage.logoutUser();
                          setCurrentUser(null);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 pt-2 border-t border-slate-800/80"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" /> Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs font-mono text-slate-400">Not signed in to Nix OS</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthModalMode("login");
                          setIsAuthModalOpen(true);
                        }}
                        className="flex-1 py-2 bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-xl hover:bg-slate-800"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthModalMode("register");
                          setIsAuthModalOpen(true);
                        }}
                        className="flex-1 py-2 bg-cyan-500 text-slate-950 text-xs font-mono font-bold rounded-xl hover:bg-cyan-400"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>


      <div className="flex flex-1 relative overflow-hidden z-10">
        {/* Left Sidebar Navigation */}
        <aside
          className={`bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 flex flex-col z-30 ${
            sidebarCollapsed ? "w-18" : "w-64"
          } hidden md:flex`}
        >
          <div className="p-3 flex-1 overflow-y-auto space-y-5">
            {["Core", "Productivity", "Life OS", "Knowledge", "Analytics", "Intelligence", "System"].map(
              (category) => {
                const items = navItems.filter((i) => i.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category} className="space-y-1">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">
                        [ {category} ]
                      </div>
                    )}
                    {items.map((item) => {
                      const isActive = currentRoute === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onRouteChange(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)] font-bold"
                              : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100 border border-transparent"
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <span className={`${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                            {item.icon}
                          </span>
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex justify-around py-2 px-1">
        {[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-cyan-400" /> },
          { id: "my-day", label: "My Day", icon: <Sun className="w-5 h-5 text-amber-400" /> },
          { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5 text-indigo-400" /> },
          { id: "finance", label: "Finance", icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
          { id: "copilot", label: "Copilot", icon: <Sparkles className="w-5 h-5 text-violet-400" /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onRouteChange(item.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold py-1 px-2 rounded-lg ${
              currentRoute === item.id ? "text-cyan-400 font-bold" : "text-slate-500"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Global Command Palette Modal */}
      <NixModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} title="Nix Command Palette">
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything across tasks, projects, finance, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1">
              Quick Navigations
            </div>
            {navItems.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onRouteChange(item.id);
                  setIsCommandOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>Open {item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400">Module</span>
              </button>
            ))}
          </div>
        </div>
      </NixModal>

      {/* Floating Copilot AI Quick Trigger Button (Global) */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="p-3.5 bg-gradient-to-tr from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-slate-950 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Open Nix Copilot AI across all modules (⌘J)"
        >
          <Sparkles className="w-5 h-5 text-slate-950 animate-pulse group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Global Copilot AI Modal */}
      <NixCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
      />

      {/* Global Quick Add Modal */}
      <NixQuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* User Registration & Login Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(usr) => {
          setCurrentUser(usr);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
};


// Global Quick Add Dialog Component
const NixQuickAddModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"task" | "transaction" | "health" | "note">("task");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSave = () => {
    if (!title.trim()) return;

    if (activeTab === "task") {
      nixStorage.saveTask({
        id: `t-${Date.now()}`,
        userId: "demo-user",
        title,
        taskType: "Daily",
        status: "Planned",
        priority: priority as any,
        tags: ["QuickAdd"],
        points: 20,
        progress: 0,
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (activeTab === "transaction") {
      nixStorage.addTransaction({
        id: `tx-${Date.now()}`,
        userId: "demo-user",
        accountId: "a1",
        type: "Expense",
        amount: parseFloat(amount) || 0,
        currency: "USD",
        category: "General",
        merchant: title,
        transactionDate: new Date().toISOString().split("T")[0],
        tags: ["QuickAdd"],
        createdAt: new Date().toISOString(),
      });
    } else if (activeTab === "note") {
      nixStorage.saveNote({
        id: `n-${Date.now()}`,
        userId: "demo-user",
        title,
        content: title,
        tags: ["QuickNote"],
        pinned: false,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setTitle("");
    setAmount("");
    onClose();
  };

  return (
    <NixModal isOpen={isOpen} onClose={onClose} title="Quick Add Record">
      <div className="space-y-4">
        <div className="flex border-b border-slate-100 dark:border-slate-800 gap-2 pb-2">
          {[
            { id: "task", label: "Task" },
            { id: "transaction", label: "Expense" },
            { id: "note", label: "Note" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {activeTab === "task" ? "Task Title" : activeTab === "transaction" ? "Merchant / Description" : "Note Title"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type entry title..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {activeTab === "transaction" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ($ USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        )}

        {activeTab === "task" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            Save Record
          </button>
        </div>
      </div>
    </NixModal>
  );
};
