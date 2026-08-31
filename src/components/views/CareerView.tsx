import React, { useState } from "react";
import { Briefcase, Building, Plus, Trash2, Edit3, AlertCircle, DollarSign, Award, FileText } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { CareerRecord, CareerRecordType, CareerStatus } from "../../types";
import { NixCard, NixModal, NixStatusBadge } from "../ui/NixUi";

export const CareerView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CareerRecord | null>(null);

  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState<CareerRecordType>("Role");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<CareerStatus>("Active");
  const [compensation, setCompensation] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const records = nixStorage.getCareerRecords();

  const openAddModal = () => {
    setEditingRecord(null);
    setTitle("");
    setRecordType("Role");
    setCompany("");
    setStatus("Active");
    setCompensation("");
    setNotes("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (rec: CareerRecord) => {
    setEditingRecord(rec);
    setTitle(rec.title);
    setRecordType(rec.recordType);
    setCompany(rec.company || "");
    setStatus(rec.status);
    setCompensation(rec.compensation || "");
    setNotes(rec.notes || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveRecord = () => {
    if (!title.trim()) {
      setFormError("Title / Role is required.");
      return;
    }

    nixStorage.saveCareerRecord({
      id: editingRecord ? editingRecord.id : undefined,
      title: title.trim(),
      recordType,
      company: company.trim(),
      status,
      compensation: compensation.trim(),
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Delete this career record?")) {
      nixStorage.deleteCareerRecord(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> CAREER & PROFESSIONAL COMMAND
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Track career roles, job applications, interview pipeline, compensation, and reviews.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Record / Role
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.length === 0 ? (
          <NixCard className="col-span-full py-12 text-center text-xs font-mono text-slate-500">No career records added yet.</NixCard>
        ) : (
          records.map((rec) => (
            <NixCard key={rec.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 font-bold">
                    {rec.recordType} {rec.company ? `• ${rec.company}` : ""}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">{rec.title}</h3>
                </div>
                <NixStatusBadge status={rec.status} />
              </div>

              {rec.compensation && (
                <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Compensation: {rec.compensation}
                </div>
              )}

              {rec.notes && <p className="text-xs text-slate-400 line-clamp-2">{rec.notes}</p>}

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
                <button onClick={() => openEditModal(rec)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-indigo-400 rounded-lg">
                  Edit
                </button>
                <button onClick={() => handleDeleteRecord(rec.id)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                  Delete
                </button>
              </div>
            </NixCard>
          ))
        )}
      </div>

      {/* Save Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? "Edit Career Record" : "Add Career Record"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Title / Role *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Staff Engineer"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Record Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as CareerRecordType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Role">Current / Past Role</option>
                <option value="Application">Job Application</option>
                <option value="Skill">Key Competency</option>
                <option value="Review">Performance Review</option>
                <option value="Milestone">Career Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Company / Org</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Stripe, Open Source..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CareerStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Accepted">Accepted</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Compensation / Offer</label>
              <input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="$200,000 / yr"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Notes / Accomplishments</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key deliverables, interview feedback, review summary..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveRecord} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-indigo-500 text-slate-950 hover:bg-indigo-400">
              Save Record
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
