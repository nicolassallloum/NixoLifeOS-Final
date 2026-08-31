import React, { useState } from "react";
import { GraduationCap, BookOpen, Award, Plus, Trash2, Edit3, AlertCircle, CheckCircle2 } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { EducationItem, EducationType, EducationStatus } from "../../types";
import { NixCard, NixModal, NixProgressBar, NixStatusBadge } from "../ui/NixUi";

export const EducationView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);

  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<EducationType>("Course");
  const [institution, setInstitution] = useState("");
  const [status, setStatus] = useState<EducationStatus>("In Progress");
  const [progress, setProgress] = useState<number>(0);
  const [skills, setSkills] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const items = nixStorage.getEducationItems();

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setItemType("Course");
    setInstitution("");
    setStatus("In Progress");
    setProgress(0);
    setSkills("");
    setNotes("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: EducationItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setItemType(item.type);
    setInstitution(item.institution || "");
    setStatus(item.status);
    setProgress(item.progress);
    setSkills(item.skillsAcquired?.join(", ") || "");
    setNotes(item.notes || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    const skillsArray = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let finalProgress = Math.min(100, Math.max(0, progress));
    if (status === "Completed") {
      finalProgress = 100;
    }

    nixStorage.saveEducationItem({
      id: editingItem ? editingItem.id : undefined,
      title: title.trim(),
      type: itemType,
      institution: institution.trim(),
      status,
      progress: finalProgress,
      skillsAcquired: skillsArray,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Delete this education item?")) {
      nixStorage.deleteEducationItem(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-400" /> EDUCATION & KNOWLEDGE TRACKER
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Manage degree modules, online courses, technical certifications, and books.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Course / Book
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <NixCard className="col-span-full py-12 text-center text-xs font-mono text-slate-500">No education items recorded yet.</NixCard>
        ) : (
          items.map((item) => (
            <NixCard key={item.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/60 font-bold">
                    {item.type} {item.institution ? `• ${item.institution}` : ""}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">{item.title}</h3>
                </div>
                <NixStatusBadge status={item.status} />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span className="font-bold text-slate-200">{item.progress}%</span>
                </div>
                <NixProgressBar progress={item.progress} colorClass="bg-sky-400" />
              </div>

              {item.skillsAcquired && item.skillsAcquired.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                  {item.skillsAcquired.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => openEditModal(item)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-sky-400 rounded-lg">
                  Edit
                </button>
                <button onClick={() => handleDeleteItem(item.id)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                  Delete
                </button>
              </div>
            </NixCard>
          ))
        )}
      </div>

      {/* Save Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Education Item" : "Add Education Item"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as EducationType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Course">Course</option>
                <option value="Book">Book</option>
                <option value="Certification">Certification</option>
                <option value="Degree">Degree</option>
                <option value="Paper">Paper</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Institution / Platform</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Coursera, MIT, Stanford..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EducationStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Progress % (0-100)</label>
              <input
                type="number"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Acquired Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="TypeScript, Cloud Infrastructure, Docker"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveItem} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-sky-500 text-slate-950 hover:bg-sky-400">
              Save Item
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
