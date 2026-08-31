import React, { useState } from "react";
import { Repeat, Plus, AlertCircle, Flame, CheckCircle2, Calendar, Award } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Habit, HabitCategory, HabitFrequency } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const HabitsView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HabitCategory>("Health");
  const [frequencyType, setFrequencyType] = useState<HabitFrequency>("Daily");
  const [targetQuantity, setTargetQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("Times");
  const [color, setColor] = useState("#10B981");
  const [formError, setFormError] = useState("");

  const habits = nixStorage.getHabits();
  const todayStr = new Date().toISOString().split("T")[0];

  const openAddModal = () => {
    setEditingHabit(null);
    setTitle("");
    setDescription("");
    setCategory("Health");
    setFrequencyType("Daily");
    setTargetQuantity(1);
    setUnit("Times");
    setColor("#10B981");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabit(h);
    setTitle(h.title);
    setDescription(h.description || "");
    setCategory(h.category);
    setFrequencyType(h.frequencyType);
    setTargetQuantity(h.targetQuantity);
    setUnit(h.unit);
    setColor(h.color || "#10B981");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveHabit = () => {
    if (!title.trim()) {
      setFormError("Habit Title is required.");
      return;
    }

    nixStorage.saveHabit({
      id: editingHabit ? editingHabit.id : undefined,
      title: title.trim(),
      description: description.trim(),
      category,
      frequencyType,
      targetQuantity,
      unit,
      color,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleToggleCheckin = (habitId: string) => {
    nixStorage.toggleHabitCheckin(habitId, todayStr);
    refresh();
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      nixStorage.deleteHabit(id);
      refresh();
    }
  };

  const filteredHabits = habits.filter((h) => {
    return categoryFilter === "All" || h.category === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-teal-400" /> HABIT CONSISTENCY ENGINE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Build daily routines, maintain streak counters, track completion logs, and earn point rewards.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
        >
          <option value="All">All Categories</option>
          <option value="Health">Health</option>
          <option value="Fitness">Fitness</option>
          <option value="Education">Education</option>
          <option value="Career">Career</option>
          <option value="Finance">Finance</option>
          <option value="Personal">Personal</option>
          <option value="Productivity">Productivity</option>
        </select>

        <span className="text-xs font-mono text-slate-400">Today: {todayStr}</span>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.length === 0 ? (
          <NixCard className="col-span-full text-center py-12 text-slate-400 text-xs font-mono">No habits created yet.</NixCard>
        ) : (
          filteredHabits.map((h) => {
            const isCompletedToday = !!(h.completedDates && h.completedDates[todayStr] && h.completedDates[todayStr] >= h.targetQuantity);

            return (
              <NixCard key={h.id} className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-teal-950/60 text-teal-400 border border-teal-800/60 font-bold">
                      {h.category} • {h.frequencyType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{h.title}</h3>
                    {h.description && <p className="text-xs text-slate-400 mt-0.5">{h.description}</p>}
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono font-bold shrink-0">
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-500" /> {h.currentStreak || 0}d
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      Target: {h.targetQuantity} {h.unit} / check-in
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Longest Streak: {h.longestStreak || 0} days
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleCheckin(h.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      isCompletedToday
                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        : "bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompletedToday ? "Completed Today" : "Log Check-in"}
                  </button>
                </div>

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => openEditModal(h)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-teal-400 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteHabit(h.id)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                    Delete
                  </button>
                </div>
              </NixCard>
            );
          })
        )}
      </div>

      {/* Save Habit Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHabit ? "Edit Habit" : "Create Habit"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Habit Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily 30-Minute Cardio Session"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context or motivation..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Health">Health</option>
                <option value="Fitness">Fitness</option>
                <option value="Education">Education</option>
                <option value="Career">Career</option>
                <option value="Finance">Finance</option>
                <option value="Personal">Personal</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Frequency</label>
              <select
                value={frequencyType}
                onChange={(e) => setFrequencyType(e.target.value as HabitFrequency)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Daily">Daily</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Target Quantity</label>
              <input
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Times, Minutes, Glasses..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveHabit} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-teal-500 text-slate-950 hover:bg-teal-400">
              Save Habit
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
