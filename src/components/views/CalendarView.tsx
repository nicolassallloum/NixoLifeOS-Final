import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Tag, Trash2, Edit3, AlertCircle } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { CalendarEvent, CalendarEventCategory, CalendarRecurrence } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const CalendarView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<CalendarEventCategory>("Meeting");
  const [recurrence, setRecurrence] = useState<CalendarRecurrence>("None");
  const [formError, setFormError] = useState("");

  const events = nixStorage.getCalendarEvents();
  const tasks = nixStorage.getTasks();
  const projects = nixStorage.getProjects();
  const goals = nixStorage.getGoals();

  const openAddModal = (dateStr?: string) => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setStartDate(dateStr || new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndDate(dateStr || new Date().toISOString().split("T")[0]);
    setEndTime("10:00");
    setAllDay(false);
    setLocation("");
    setCategory("Meeting");
    setRecurrence("None");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (e: CalendarEvent) => {
    setEditingEvent(e);
    setTitle(e.title);
    setDescription(e.description || "");
    setStartDate(e.startDate);
    setStartTime(e.startTime);
    setEndDate(e.endDate);
    setEndTime(e.endTime);
    setAllDay(e.allDay);
    setLocation(e.location || "");
    setCategory(e.eventCategory);
    setRecurrence(e.recurrence);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!title.trim()) {
      setFormError("Event Title is required.");
      return;
    }
    const startIso = `${startDate}T${startTime}`;
    const endIso = `${endDate}T${endTime}`;
    if (!allDay && endIso < startIso) {
      setFormError("End time cannot be earlier than start time.");
      return;
    }

    nixStorage.saveCalendarEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title: title.trim(),
      description: description.trim(),
      startDate,
      startTime,
      endDate,
      endTime,
      allDay,
      location,
      eventCategory: category,
      recurrence,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      nixStorage.deleteCalendarEvent(id);
      refresh();
    }
  };

  // Month rendering math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-violet-400" /> MASTER CALENDAR & SCHEDULE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Unified schedule incorporating calendar events, task due dates, project deadlines, and goal targets.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg ${viewMode === "month" ? "bg-violet-500/20 text-violet-300 font-bold" : "text-slate-400"}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg ${viewMode === "week" ? "bg-violet-500/20 text-violet-300 font-bold" : "text-slate-400"}`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800 font-mono text-xs">
        <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-100 text-sm">
          {monthNames[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-slate-100">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month Grid */}
      <NixCard>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty padding days before day 1 */}
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-2 min-h-[90px] bg-slate-950/30 rounded-xl border border-slate-900/50" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

            const dayEvents = events.filter((e) => e.startDate === dateStr);
            const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
            const dayProjects = projects.filter((p) => p.dueDate === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => openAddModal(dateStr)}
                className="p-2 min-h-[90px] bg-slate-900/40 rounded-xl border border-slate-800/60 hover:border-violet-500/40 transition-all cursor-pointer space-y-1"
              >
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                  <span>{dayNum}</span>
                  {dayEvents.length + dayTasks.length > 0 && (
                    <span className="text-violet-400 font-bold">{dayEvents.length + dayTasks.length} items</span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[70px]">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        openEditModal(e);
                      }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-violet-950/80 border border-violet-800/80 text-violet-300 truncate"
                    >
                      {e.startTime} {e.title}
                    </div>
                  ))}

                  {dayTasks.map((t) => (
                    <div key={t.id} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 truncate">
                      Task: {t.title}
                    </div>
                  ))}

                  {dayProjects.map((p) => (
                    <div key={p.id} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 truncate">
                      Proj: {p.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </NixCard>

      {/* Save Event Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? "Edit Event" : "Create Calendar Event"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quarterly Strategy Review"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda or notes..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Meeting">Meeting</option>
                <option value="Personal">Personal</option>
                <option value="Task">Task</option>
                <option value="Project">Project</option>
                <option value="Goal">Goal</option>
                <option value="Habit">Habit</option>
                <option value="Appointment">Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Google Meet or Office Room 4"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            {editingEvent && (
              <button onClick={() => handleDeleteEvent(editingEvent.id)} className="px-3 py-1.5 rounded-xl text-xs font-mono bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">
                Delete Event
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
                Cancel
              </button>
              <button onClick={handleSaveEvent} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-violet-500 text-slate-950 hover:bg-violet-400">
                Save Event
              </button>
            </div>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
