import React, { useState } from "react";
import { Sun, CheckSquare, Clock, Plus, Sparkles, Trophy, Calendar as CalendarIcon, Pill, Wallet, ChevronRight } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixCard, NixStatusBadge, NixPriorityBadge } from "../ui/NixUi";

export const MyDayView: React.FC<{ onRouteChange: (route: string) => void }> = ({ onRouteChange }) => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [newPriority, setNewPriority] = useState("");
  const [eveningReviewOpen, setEveningReviewOpen] = useState(false);

  const tasks = nixStorage.getTasks();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  const handleAddPriority = () => {
    if (!newPriority.trim()) return;
    nixStorage.saveTask({
      userId: "demo-user",
      title: newPriority.trim(),
      status: "Planned",
      priority: "High",
      dueDate: todayStr,
      points: 25,
    });
    setNewPriority("");
    refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400 mb-1">
            <Sun className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: "10s" }} />
            <span>My Day Planner</span>
          </div>
          <h1 className="text-2xl font-mono font-extrabold text-slate-100">DAILY MISSION FOCUS</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => setEveningReviewOpen((prev) => !prev)}
          className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold hover:bg-amber-500/30 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        >
          {eveningReviewOpen ? "CLOSE REVIEW" : "EVENING REVIEW"}
        </button>
      </div>

      {/* Evening Review Section */}
      {eveningReviewOpen && (
        <NixCard className="bg-amber-50/50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">🌇 Evening Reflection & Daily Review</h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
            Review completed work, track your energy level, and prepare tomorrow's top 3 priorities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900">
              <span className="font-bold block text-slate-800 dark:text-slate-200 mb-1">Energy & Mood</span>
              <div className="flex gap-2">
                {["⚡ High", "⚖️ Balanced", "🌙 Tired"].map((m) => (
                  <button key={m} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium hover:bg-amber-100">
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 md:col-span-2">
              <span className="font-bold block text-slate-800 dark:text-slate-200 mb-1">Reflection Notes</span>
              <input
                type="text"
                placeholder="What went well today? What will you improve tomorrow?"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
              />
            </div>
          </div>
        </NixCard>
      )}

      {/* Quick Priority Input */}
      <NixCard>
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-cyan-400 mb-3">Add Top Priority for Today</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
            placeholder="Type priority title and press Enter..."
            className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-hidden"
          />
          <button
            onClick={handleAddPriority}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Priority
          </button>
        </div>
      </NixCard>

      {/* Main Today Tasks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          Scheduled & Planned for Today ({todayTasks.length})
        </h3>

        {todayTasks.length === 0 ? (
          <NixCard className="text-center py-8">
            <p className="text-xs font-mono text-slate-500">No priorities added for today yet. Add one above or ask Nix Copilot!</p>
          </NixCard>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-2xs flex items-center justify-between hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "Finished"}
                  onChange={() => {
                    const isFin = task.status === "Finished";
                    nixStorage.saveTask({
                      ...task,
                      status: isFin ? "Planned" : "Finished",
                    });
                    if (!isFin) nixStorage.addPoints(task.points, `Completed priority: ${task.title}`);
                    refresh();
                  }}
                  className="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <h4 className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${task.status === "Finished" ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                    <span className="text-amber-400 font-semibold">+{task.points} pts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRouteChange("focus")}
                  className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-100 transition-colors font-mono"
                >
                  Start Focus
                </button>
                <NixPriorityBadge priority={task.priority} />
                <NixStatusBadge status={task.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
