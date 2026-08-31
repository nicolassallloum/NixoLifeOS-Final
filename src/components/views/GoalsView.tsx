import React, { useState } from "react";
import { Target, Plus, AlertCircle, TrendingUp, Calendar, CheckCircle2, History, Award } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Goal, GoalCategory, GoalStatus } from "../../types";
import { NixCard, NixProgressBar, NixStatusBadge, NixModal } from "../ui/NixUi";

export const GoalsView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [logGoalModal, setLogGoalModal] = useState<Goal | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Career");
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState("Units");
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<GoalStatus>("Active");
  const [formError, setFormError] = useState("");

  // Log Progress Modal State
  const [logUnits, setLogUnits] = useState<number>(10);
  const [logNote, setLogNote] = useState("");

  const goals = nixStorage.getGoals();

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle("");
    setDescription("");
    setCategory("Career");
    setTargetValue(100);
    setCurrentValue(0);
    setUnit("Units");
    setCreatedDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setStatus("Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description || "");
    setCategory(g.category);
    setTargetValue(g.targetValue);
    setCurrentValue(g.currentValue);
    setUnit(g.unit || "Units");
    setCreatedDate(g.createdDate);
    setDueDate(g.dueDate);
    setStatus(g.status);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveGoal = () => {
    if (!title.trim()) {
      setFormError("Goal Title is required.");
      return;
    }
    if (!targetValue || targetValue <= 0) {
      setFormError("Target Value must be greater than 0.");
      return;
    }
    if (dueDate < createdDate) {
      setFormError("Due Date cannot be before Creation Date.");
      return;
    }

    nixStorage.saveGoal({
      id: editingGoal ? editingGoal.id : undefined,
      title: title.trim(),
      description: description.trim(),
      category,
      targetValue,
      currentValue,
      unit,
      createdDate,
      dueDate,
      status,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleLogProgress = () => {
    if (logGoalModal && logUnits > 0) {
      nixStorage.logGoalProgress(logGoalModal.id, logUnits, logNote);
      setLogGoalModal(null);
      setLogNote("");
      refresh();
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      nixStorage.deleteGoal(id);
      refresh();
    }
  };

  const filteredGoals = goals.filter((g) => {
    const matchesCategory = categoryFilter === "All" || g.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || g.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> STRATEGIC GOALS & OBJECTIVES
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Define quantitative targets, initial daily pace, required remaining daily targets, and log progress.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
        >
          <option value="All">All Categories</option>
          <option value="Finance">Finance</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Career">Career</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
        >
          <option value="All">All Statuses</option>
          <option value="Planned">Planned</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Paused">Paused</option>
        </select>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.length === 0 ? (
          <NixCard className="col-span-full text-center py-12 text-slate-400 text-xs font-mono">No strategic goals found.</NixCard>
        ) : (
          filteredGoals.map((g) => {
            const logs = nixStorage.getGoalLogs(g.id);

            return (
              <NixCard key={g.id} className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold">
                      {g.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{g.title}</h3>
                    {g.description && <p className="text-xs text-slate-400 mt-0.5">{g.description}</p>}
                  </div>
                  <NixStatusBadge status={g.status} />
                </div>

                {/* Quantitative Metric */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-slate-400">Target Progress</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {g.currentValue} / {g.targetValue} {g.unit}
                    </span>
                  </div>
                  <NixProgressBar progress={g.progressPercentage} colorClass="bg-emerald-400" />
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>
                      Initial Target Pace: <strong className="text-slate-200">{g.initialDailyTarget} {g.unit}/day</strong>
                    </div>
                    <div>
                      Required Remaining Pace: <strong className="text-emerald-400">{g.currentRequiredDailyTarget} {g.unit}/day</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Due: {g.dueDate} ({g.totalDays} total days)</span>
                  <button
                    onClick={() => {
                      setLogGoalModal(g);
                      setLogUnits(10);
                    }}
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold hover:bg-emerald-500/30 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Progress
                  </button>
                </div>

                {logs.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                    Last Logged: +{logs[0].completedUnits} {g.unit} on {logs[0].date} {logs[0].note && `(${logs[0].note})`}
                  </div>
                )}

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => openEditModal(g)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-emerald-400 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteGoal(g.id)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                    Delete
                  </button>
                </div>
              </NixCard>
            );
          })
        )}
      </div>

      {/* Goal Save Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? "Edit Goal" : "Create Strategic Goal"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Goal Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Save $10,000 Emergency Reserve"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Finance">Finance</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Career">Career</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="USD, Hours, Books..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Target Value *</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Current Value</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Creation Date</label>
              <input
                type="date"
                value={createdDate}
                onChange={(e) => setCreatedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Target Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            >
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveGoal} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Save Goal
            </button>
          </div>
        </div>
      </NixModal>

      {/* Log Progress Modal */}
      {logGoalModal && (
        <NixModal isOpen={!!logGoalModal} onClose={() => setLogGoalModal(null)} title={`Log Progress for ${logGoalModal.title}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Units Completed ({logGoalModal.unit})</label>
              <input
                type="number"
                value={logUnits}
                onChange={(e) => setLogUnits(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Note (Optional)</label>
              <input
                type="text"
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder="e.g. Completed weekly savings contribution"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setLogGoalModal(null)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
                Cancel
              </button>
              <button onClick={handleLogProgress} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                Confirm Log
              </button>
            </div>
          </div>
        </NixModal>
      )}
    </div>
  );
};
