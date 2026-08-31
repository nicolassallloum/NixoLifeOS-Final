import React, { useState } from "react";
import { FileText, Plus, Pin, Trash2, Edit3, Tag, Folder, AlertCircle, Search } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Note } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const NotesView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folder, setFolder] = useState("General");
  const [tagsStr, setTagsStr] = useState("");
  const [pinned, setPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");

  const notes = nixStorage.getNotes();

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.folder && n.folder.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setFolder("General");
    setTagsStr("");
    setPinned(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder || "General");
    setTagsStr(note.tags?.join(", ") || "");
    setPinned(note.pinned || false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      setFormError("Note Title is required.");
      return;
    }

    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const saved = nixStorage.saveNote({
      id: editingNote ? editingNote.id : undefined,
      title: title.trim(),
      content: content.trim(),
      folder: folder.trim(),
      tags,
      pinned,
    });

    setIsModalOpen(false);
    setSelectedNote(saved);
    refresh();
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      nixStorage.deleteNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
      refresh();
    }
  };

  const activeNote = selectedNote || filteredNotes[0] || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> KNOWLEDGE BASE & NOTEBOOK
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Organize Markdown notes, folders, tags, and cross-linked task context.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes Sidebar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px]">
            {filteredNotes.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-8">No matching notes found.</p>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNote(n)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 font-mono ${
                      isSelected ? "bg-amber-500/10 border-amber-500/40 text-slate-100" : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold truncate flex items-center gap-1.5">
                        {n.pinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />} {n.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">{n.folder || "General"}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{n.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Note Reader / Viewer */}
        <div className="md:col-span-2">
          <NixCard className="min-h-[450px] flex flex-col justify-between space-y-4">
            {activeNote ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-bold">
                      {activeNote.folder || "General"}
                    </span>
                    <h2 className="text-base font-bold text-slate-100 mt-1">{activeNote.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(activeNote)} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-amber-400 rounded-lg">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteNote(activeNote.id)} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-rose-400 rounded-lg">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  {activeNote.content}
                </div>

                {activeNote.tags && activeNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {activeNote.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-amber-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 font-mono text-xs">Select a note from the list or create a new note.</div>
            )}
          </NixCard>
        </div>
      </div>

      {/* Save Note Modal */}
      <NixModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? "Edit Note" : "Create Note"}>
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Note Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Architecture Guidelines"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Folder</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="General, Work, Personal..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="arch, react, backend"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Markdown Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write Markdown text here..."
              rows={8}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded bg-slate-900 border-slate-800" />
              Pin Note to Top
            </label>

            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
