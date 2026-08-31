import React, { useState } from "react";
import {
  CheckSquare,
  FolderKanban,
  Target,
  Repeat,
  Wallet,
  Activity,
  Trophy,
  Sparkles,
  ArrowUpRight,
  Clock,
  Droplets,
  Pill,
} from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixCard, NixMetricCard, NixProgressBar, NixStatusBadge, NixPriorityBadge } from "../ui/NixUi";

export const DashboardView: React.FC<{ onRouteChange: (route: string) => void }> = ({ onRouteChange }) => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const tasks = nixStorage.getTasks();
  const projects = nixStorage.getProjects();
  const goals = nixStorage.getGoals();
  const habits = nixStorage.getHabits();
  const accounts = nixStorage.getAccounts();
  const medications = nixStorage.getMedications();
  const pointsProfile = nixStorage.getPointsProfile();

  const completedTasks = tasks.filter((t) => t.status === "Finished").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const netWorth = accounts.reduce((sum, acc) => (acc.includeInNetWorth ? sum + acc.currentBalance : sum), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Greeting & Morning Briefing Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-cyan-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Nix Copilot Morning Briefing</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 font-mono">
            COMMAND CENTER ACTIVE
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed font-sans">
            You have <span className="text-cyan-400 font-bold">{tasks.filter((t) => t.status !== "Finished").length} active tasks</span> today,{" "}
            <span className="text-cyan-400 font-bold">{projects.filter((p) => (p.status as string) === "Active" || p.status === "In Progress").length} projects on track</span>, and a{" "}
            <span className="text-amber-300 font-bold font-mono">{habits[0]?.currentStreak || 12}-DAY HABIT STREAK</span>. Your telemetry feeds are synced.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onRouteChange("my-day")}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-mono font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <span>Open My Day Plan</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRouteChange("copilot")}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold backdrop-blur-md transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Nix Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NixMetricCard
          title="Task Completion"
          value={`${taskCompletionRate}%`}
          subtitle={`${completedTasks} of ${tasks.length} finished`}
          change="+12% this week"
          isPositive={true}
          icon={<CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
        />
        <NixMetricCard
          title="Active Projects"
          value={projects.filter((p) => (p.status as string) === "Active" || p.status === "In Progress").length}
          subtitle="All on schedule"
          change="On Track"
          isPositive={true}
          icon={<FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          accentColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
        />
        <NixMetricCard
          title="Total Net Worth"
          value={`$${netWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle="Across 3 linked accounts"
          change="+$1,450.00"
          isPositive={true}
          icon={<Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          accentColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        />
        <NixMetricCard
          title="Level & Points"
          value={`Lvl ${pointsProfile.currentLevel}`}
          subtitle={`${pointsProfile.totalPoints} total productivity pts`}
          change={`${pointsProfile.dailyStreak} day streak`}
          isPositive={true}
          icon={<Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          accentColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        />
      </div>

      {/* Two Column Layout: Today's Focus & Active Projects / Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priorities Widget */}
          <NixCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Today's Top Priorities
              </h3>
              <button
                onClick={() => onRouteChange("tasks")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All Tasks
              </button>
            </div>
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === "Finished"}
                      onChange={() => {
                        const updated = {
                          ...task,
                          status: task.status === "Finished" ? ("Planned" as const) : ("Finished" as const),
                        };
                        nixStorage.saveTask(updated);
                        if (updated.status === "Finished") nixStorage.addPoints(task.points, `Completed task: ${task.title}`);
                        refresh();
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span
                        className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${
                          task.status === "Finished" ? "line-through opacity-50" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="block text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" /> Due {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <NixPriorityBadge priority={task.priority} />
                    <NixStatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </NixCard>

          {/* Active Projects Widget */}
          <NixCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                Active Projects Progress
              </h3>
              <button
                onClick={() => onRouteChange("projects")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage Projects
              </button>
            </div>
            <div className="space-y-4">
              {projects.filter(Boolean).map((project) => (
                <div key={project.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{project?.name || "Untitled Project"}</span>
                    <NixStatusBadge status={project?.health || "On Track"} />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{project?.description || ""}</p>
                  <NixProgressBar progress={project?.progress || 0} />
                </div>
              ))}
            </div>
          </NixCard>
        </div>

        {/* Side Column (1 col) */}
        <div className="space-y-6">
          {/* Active Goals Widget */}
          <NixCard>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Goals Progress
              </h3>
              <button onClick={() => onRouteChange("goals")} className="text-xs text-indigo-600 hover:underline font-semibold">
                View Goals
              </button>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[180px]">{goal.title}</span>
                    <span>
                      {goal.currentValue}/{goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <NixProgressBar progress={goal.progress} colorClass="bg-emerald-500" showLabel={false} />
                </div>
              ))}
            </div>
          </NixCard>

          {/* Daily Habits & Medication Schedule */}
          <NixCard>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-600" /> Habits & Health
              </h3>
              <button onClick={() => onRouteChange("habits")} className="text-xs text-indigo-600 hover:underline font-semibold">
                Habit Log
              </button>
            </div>
            <div className="space-y-2.5">
              {habits.filter(Boolean).map((habit) => (
                <div key={habit.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{habit?.name || "Habit"}</div>
                      <div className="text-[10px] text-slate-500">{habit?.currentStreak || 0} day streak</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (habit?.id) nixStorage.toggleHabitCheckin(habit.id, new Date().toISOString().split("T")[0]);
                      refresh();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold"
                  >
                    Log
                  </button>
                </div>
              ))}
              {medications.filter(Boolean).map((med) => (
                <div key={med.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{med?.name || "Medication"}</div>
                      <div className="text-[10px] text-slate-500">{med?.dose || ""} ({med?.strength || ""})</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (med?.id) nixStorage.logMedicationStatus(med.id, `${new Date().toISOString().split("T")[0]} 08:00`, "Taken");
                      refresh();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold"
                  >
                    Take
                  </button>
                </div>
              ))}
            </div>
          </NixCard>
        </div>
      </div>
    </div>
  );
};
