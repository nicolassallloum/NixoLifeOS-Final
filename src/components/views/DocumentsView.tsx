import React, { useState } from "react";
import { Lock, Unlock, Shield, FileText, Plus, AlertCircle, Trash2, Eye, EyeOff, Calendar, AlertTriangle } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixDocument, DocumentCategory, DocumentFileType } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const DocumentsView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<NixDocument | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Financial");
  const [fileType, setFileType] = useState<DocumentFileType>("PDF");
  const [isSensitive, setIsSensitive] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const docs = nixStorage.getDocuments();
  const todayStr = new Date().toISOString().split("T")[0];

  const openAddModal = () => {
    setEditingDoc(null);
    setTitle("");
    setCategory("Financial");
    setFileType("PDF");
    setIsSensitive(false);
    setExpirationDate("");
    setNotes("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveDoc = () => {
    if (!title.trim()) {
      setFormError("Document Title is required.");
      return;
    }

    nixStorage.saveDocument({
      id: editingDoc ? editingDoc.id : undefined,
      title: title.trim(),
      category,
      fileType,
      isSensitive,
      expirationDate: expirationDate || undefined,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    refresh();
  };

  const handleDeleteDoc = (id: string) => {
    if (window.confirm("Delete this document entry?")) {
      nixStorage.deleteDocument(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> SECURE DOCUMENT VAULT
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Encrypted metadata vault for passports, tax returns, insurance policies, and legal records.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUnlocked(!isUnlocked)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isUnlocked
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isUnlocked ? "Lock Vault" : "Unlock Sensitive View"}
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.length === 0 ? (
          <NixCard className="col-span-full py-12 text-center text-xs font-mono text-slate-500">No documents catalogued in vault.</NixCard>
        ) : (
          docs.map((d) => {
            const isExpiringSoon = d.expirationDate && d.expirationDate <= new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
            const isExpired = d.expirationDate && d.expirationDate < todayStr;
            const isRedacted = d.isSensitive && !isUnlocked;

            return (
              <NixCard key={d.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                      {d.category} • {d.fileType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">
                      {isRedacted ? "•••••••••••• (Sensitive Document)" : d.title}
                    </h3>
                  </div>

                  {d.isSensitive && (
                    <span className="p-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                      SENSITIVE
                    </span>
                  )}
                </div>

                {d.expirationDate && (
                  <div
                    className={`text-[11px] font-mono flex items-center gap-1 ${
                      isExpired
                        ? "text-rose-400 font-bold"
                        : isExpiringSoon
                        ? "text-amber-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Expiration: {d.expirationDate}
                    {isExpired && " (EXPIRED)"}
                    {isExpiringSoon && !isExpired && " (EXPIRING SOON)"}
                  </div>
                )}

                {!isRedacted && d.notes && <p className="text-xs text-slate-400">{d.notes}</p>}

                <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
                  <button onClick={() => handleDeleteDoc(d.id)} className="px-2.5 py-1 bg-slate-900 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                    Delete
                  </button>
                </div>
              </NixCard>
            );
          })
        )}
      </div>

      {/* Save Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catalogue Document in Vault">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. US Passport / Tax Return 2025"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="ID / Passports">ID / Passports</option>
                <option value="Financial">Financial</option>
                <option value="Medical">Medical</option>
                <option value="Insurance">Insurance</option>
                <option value="Tax">Tax</option>
                <option value="Legal">Legal</option>
                <option value="Education">Education</option>
                <option value="Career">Career</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">File Format</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as DocumentFileType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="PDF">PDF</option>
                <option value="Image">Image</option>
                <option value="Text">Text</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Expiration Date (Optional)</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800"
                />
                Mark as Sensitive (Redacted)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Notes / Vault Context</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference numbers, physical folder location..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveDoc} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Save Document
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
