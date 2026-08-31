import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Terminal, FileCode } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { AuditLogEvent } from "../../types";
import { NixCard } from "../ui/NixUi";

export const AuditView: React.FC = () => {
  const [actionFilter, setActionFilter] = useState<string>("All");
  const [entityFilter, setEntityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const auditLogs = nixStorage.getAuditLogs();

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "All" || log.action === actionFilter;
    const matchesEntity = entityFilter === "All" || log.entityType === entityFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> IMMUTABLE AUDIT LOG & SYSTEM HEALTH
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time audit trail logging state mutations, security checks, and points calculations.</p>
        </div>

        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold">
          Total Logs: {auditLogs.length}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
        >
          <option value="All">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="CHECKIN">CHECKIN</option>
          <option value="POINTS_AWARDED">POINTS_AWARDED</option>
          <option value="AUTH">AUTH</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
        >
          <option value="All">All Entities</option>
          <option value="Task">Task</option>
          <option value="Project">Project</option>
          <option value="Goal">Goal</option>
          <option value="Habit">Habit</option>
          <option value="Finance">Finance</option>
          <option value="Medication">Medication</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Career">Career</option>
          <option value="Note">Note</option>
          <option value="Document">Document</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <NixCard className="space-y-3">
        <div className="space-y-2 max-h-[550px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">No audit logs matching current filter.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === "CREATE"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : log.action === "DELETE"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-sky-950 text-sky-400 border border-sky-800"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-slate-200 font-bold">{log.entityType}</span>
                    {log.entityId && <span className="text-slate-500 text-[10px]">({log.entityId})</span>}
                  </div>

                  <span className="text-[10px] text-slate-500">{log.timestamp.substring(0, 19).replace("T", " ")}</span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-900 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </NixCard>
    </div>
  );
};
