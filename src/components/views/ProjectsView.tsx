import React, { useState } from "react";
import { FolderKanban, Plus, Filter, Trash2, Edit3, CheckCircle2, AlertCircle, Calendar, Folder, CheckSquare } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Project, ProjectStatus, Priority, Task } from "../../types";
import { NixCard, NixProgressBar, NixStatusBadge, NixPriorityBadge, NixModal } from "../ui/NixUi";

export const ProjectsView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [status, setStatus] = useState<ProjectStatus>("Planned");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState("");

  // New task inline inside project detail
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const projects = nixStorage.getProjects();
  const allTasks = nixStorage.getTasks();

  const openAddModal = () => {
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Planned");
    setDueDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setDescription(p.description || "");
    setPriority(p.priority);
    setStatus(p.status);
    setDueDate(p.dueDate);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!title.trim()) {
      setFormError("Project Title is required.");
      return;
    }

    nixStorage.saveProject({
      id: editingProject ? editingProject.id : undefined,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate,
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      nixStorage.deleteProject(id);
      if (detailProject?.id === id) setDetailProject(null);
      refresh();
    }
  };

  const handleAddTaskToProject = (projId: string) => {
    if (!newTaskTitle.trim()) return;
    nixStorage.saveTask({
      title: newTaskTitle.trim(),
      projectId: projId,
      status: "Planned",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setNewTaskTitle("");
    refresh();
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" /> ENTERPRISE PROJECTS ENGINE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Manage key initiatives, task linkages, progress tracking, and milestone completion.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        >
          <option value="All">All Statuses</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Finished">Finished</option>
          <option value="On Hold">On Hold</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-hidden focus:border-cyan-500/50"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <NixCard className="col-span-full text-center py-12 text-slate-400 text-xs font-mono">No projects found matching criteria.</NixCard>
        ) : (
          filteredProjects.map((p) => {
            const linkedTasks = allTasks.filter((t) => t.projectId === p.id && !t.deletedAt);
            const finishedTasks = linkedTasks.filter((t) => t.status === "Finished");

            return (
              <NixCard key={p.id} className="space-y-4 hover:border-cyan-500/40 transition-all cursor-pointer" onClick={() => setDetailProject(p)}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-cyan-400" /> {p.title}
                    </h3>
                    {p.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <NixPriorityBadge priority={p.priority} />
                    <NixStatusBadge status={p.status} />
                  </div>
                </div>

                <div className="space-y-1">
                  <NixProgressBar progress={p.progressPercentage} />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>
                      Tasks: {finishedTasks.length} / {linkedTasks.length} finished
                    </span>
                    <span>Target: {p.dueDate}</span>
                  </div>
                </div>

                {p.progressPercentage === 100 && p.status !== "Finished" && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center justify-between">
                    <span>All tasks complete! Ready to finish.</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nixStorage.saveProject({ ...p, status: "Finished" });
                        refresh();
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                    >
                      Complete Project
                    </button>
                  </div>
                )}

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </NixCard>
            );
          })
        )}
      </div>

      {/* Save Project Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? "Edit Project" : "Create New Project"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nix Life OS Architecture Refactor"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project goals and target outcomes..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Finished">Finished</option>
                <option value="On Hold">On Hold</option>
              </select>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveProject} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Save Project
            </button>
          </div>
        </div>
      </NixModal>

      {/* Project Detail Modal */}
      {detailProject && (
        <NixModal isOpen={!!detailProject} onClose={() => setDetailProject(null)} title={`Project: ${detailProject.title}`}>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-slate-300">{detailProject.description || "No description provided."}</p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-2">
                <span>Priority: {detailProject.priority}</span>
                <span>Status: {detailProject.status}</span>
                <span>Due: {detailProject.dueDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <NixProgressBar progress={detailProject.progressPercentage} />
              <div className="text-right text-[10px] font-mono text-slate-400">{detailProject.progressPercentage}% Completed</div>
            </div>

            {/* Inline Quick Add Task */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add task to this project..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
              <button
                onClick={() => handleAddTaskToProject(detailProject.id)}
                className="px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono hover:bg-cyan-400"
              >
                Add
              </button>
            </div>

            {/* Grouped Tasks */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Project Tasks Breakdown</h4>
              {allTasks.filter((t) => t.projectId === detailProject.id).length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-4 text-center">No tasks linked to this project yet.</p>
              ) : (
                <div className="space-y-2">
                  {allTasks
                    .filter((t) => t.projectId === detailProject.id)
                    .map((t) => (
                      <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={t.status === "Finished"}
                            onChange={() => {
                              nixStorage.saveTask({
                                ...t,
                                status: t.status === "Finished" ? "Planned" : "Finished",
                              });
                              refresh();
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-950"
                          />
                          <span className={`text-xs font-bold text-slate-200 ${t.status === "Finished" ? "line-through text-slate-500" : ""}`}>
                            {t.title}
                          </span>
                        </div>
                        <NixStatusBadge status={t.status} />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </NixModal>
      )}
    </div>
  );
};
