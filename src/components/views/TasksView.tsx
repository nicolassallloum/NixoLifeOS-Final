import React, { useState } from "react";
import { CheckSquare, Plus, Filter, LayoutGrid, List, Kanban as KanbanIcon, Trash2, Edit3, AlertCircle, Calendar, RefreshCw, Folder } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Task, Priority, TaskStatus, Project } from "../../types";
import { NixCard, NixStatusBadge, NixPriorityBadge, NixModal } from "../ui/NixUi";

export const TasksView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [activeTab, setActiveTab] = useState<"all" | "planned" | "in_progress" | "finished" | "overdue" | "by_project">("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>("All");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reopenConfirmTask, setReopenConfirmTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("Planned");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState("17:00");
  const [formError, setFormError] = useState("");

  const tasks = nixStorage.getTasks();
  const projects = nixStorage.getProjects();

  const openAddModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setProjectId("");
    setPriority("Medium");
    setStatus("Planned");
    setDueDate(new Date().toISOString().split("T")[0]);
    setDueTime("17:00");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setProjectId(t.projectId || "");
    setPriority(t.priority);
    setStatus(t.status);
    setDueDate(t.dueDate);
    setDueTime(t.dueTime || "17:00");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setFormError("Task Title is required.");
      return;
    }
    if (!dueDate) {
      setFormError("Due Date is required.");
      return;
    }

    nixStorage.saveTask({
      id: editingTask ? editingTask.id : undefined,
      title: title.trim(),
      description: description.trim(),
      projectId: projectId || undefined,
      priority,
      dueDate,
      dueTime,
      status,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (task.status === "Finished" && newStatus !== "Finished") {
      // Reopening prompt required
      setReopenConfirmTask(task);
      return;
    }

    nixStorage.saveTask({
      ...task,
      status: newStatus,
    });
    refresh();
  };

  const confirmReopen = () => {
    if (reopenConfirmTask) {
      nixStorage.saveTask({
        ...reopenConfirmTask,
        status: "In Progress",
      });
      setReopenConfirmTask(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      nixStorage.deleteTask(id);
      refresh();
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = selectedPriorityFilter === "All" || t.priority === selectedPriorityFilter;
    const matchesProject = selectedProjectFilter === "All" || t.projectId === selectedProjectFilter;

    let matchesTab = true;
    if (activeTab === "planned") matchesTab = t.status === "Planned";
    else if (activeTab === "in_progress") matchesTab = t.status === "In Progress";
    else if (activeTab === "finished") matchesTab = t.status === "Finished";
    else if (activeTab === "overdue") matchesTab = t.status !== "Finished" && t.dueDate < todayStr;
    else if (activeTab === "by_project") matchesTab = !!t.projectId;

    return matchesSearch && matchesPriority && matchesProject && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" /> EXECUTIVE TASKS ENGINE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Organize tasks by status, project linkage, priorities, and workflow triggers.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${viewMode === "list" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400"}`}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${viewMode === "kanban" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400"}`}
            >
              <KanbanIcon className="w-4 h-4" /> Board
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1 pb-1">
        {[
          { id: "all", label: "All Tasks", count: tasks.length },
          { id: "planned", label: "Planned", count: tasks.filter((t) => t.status === "Planned").length },
          { id: "in_progress", label: "In Progress", count: tasks.filter((t) => t.status === "In Progress").length },
          { id: "finished", label: "Finished", count: tasks.filter((t) => t.status === "Finished").length },
          { id: "overdue", label: "Overdue", count: tasks.filter((t) => t.status !== "Finished" && t.dueDate < todayStr).length },
          { id: "by_project", label: "By Project", count: tasks.filter((t) => !!t.projectId).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-800">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search task title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        />
        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
          <option value="Urgent">Urgent Priority</option>
        </select>
        <select
          value={selectedProjectFilter}
          onChange={(e) => setSelectedProjectFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        >
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* List Mode */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <NixCard className="text-center py-12 text-slate-400 text-xs font-mono">No tasks found matching current view filters.</NixCard>
          ) : (
            filteredTasks.map((t) => {
              const project = projects.find((p) => p.id === t.projectId);
              const isOverdue = t.status !== "Finished" && t.dueDate < todayStr;

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl bg-slate-950/70 border ${
                    isOverdue ? "border-rose-500/40 bg-rose-950/10" : "border-slate-800/80"
                  } flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <input
                      type="checkbox"
                      checked={t.status === "Finished"}
                      onChange={() => handleStatusChange(t, t.status === "Finished" ? "Planned" : "Finished")}
                      className="mt-1 w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold text-slate-100 ${t.status === "Finished" ? "line-through text-slate-500" : ""}`}>{t.title}</h4>
                        {project && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
                            <Folder className="w-3 h-3" /> {project.title}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                      {t.description && <p className="text-xs text-slate-400 mt-1">{t.description}</p>}

                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Due: {t.dueDate} {t.dueTime || ""}
                        </span>
                        <span>Pts: +{t.points}</span>
                        {t.startedAt && <span className="text-slate-500">Started: {t.startedAt.substring(0, 10)}</span>}
                        {t.finishedAt && <span className="text-emerald-400">Finished: {t.finishedAt.substring(0, 10)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Finished">Finished</option>
                    </select>

                    <NixPriorityBadge priority={t.priority} />

                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Board Mode */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["Planned", "In Progress", "Finished"] as TaskStatus[]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  <span>{colStatus}</span>
                  <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] text-cyan-400">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map((t) => (
                    <NixCard key={t.id} className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-100">{t.title}</span>
                        <NixPriorityBadge priority={t.priority} />
                      </div>
                      {t.description && <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                        <span>{t.dueDate}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(t)} className="hover:text-cyan-400">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="hover:text-rose-400">
                            Delete
                          </button>
                        </div>
                      </div>
                    </NixCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? "Edit Task" : "Create Task"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete v1.0 Release Candidate Audit"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Linked Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-hidden focus:border-cyan-500"
            >
              <option value="">-- No Linked Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed task guidelines..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-sm"
            >
              Save Task
            </button>
          </div>
        </div>
      </NixModal>

      {/* Reopen Confirmation Modal */}
      <NixModal isOpen={!!reopenConfirmTask} onClose={() => setReopenConfirmTask(null)} title="Reopen Finished Task?">
        <div className="space-y-4">
          <p className="text-xs font-mono text-slate-300">
            Reopening task <strong className="text-cyan-400">"{reopenConfirmTask?.title}"</strong> will move its status from Finished back to In Progress.
            This will update the progress percentage of any linked project.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setReopenConfirmTask(null)} className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={confirmReopen} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400">
              Confirm Reopen
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
