import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Award, Folder, CheckSquare } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { FocusSessionStatus, Task, Project } from "../../types";
import { NixCard } from "../ui/NixUi";

export const FocusView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [plannedMinutes, setPlannedMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [timerStatus, setTimerStatus] = useState<FocusSessionStatus>("Paused");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [sessionNote, setSessionNote] = useState<string>("");
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);

  const tasks = nixStorage.getTasks();
  const projects = nixStorage.getProjects();
  const sessions = nixStorage.getFocusSessions();

  useEffect(() => {
    const handleCopilotStart = (e: any) => {
      const detail = e.detail;
      if (detail) {
        const mins = detail.plannedMinutes || 25;
        setPlannedMinutes(mins);
        setSecondsLeft(mins * 60);
        setSessionNote(detail.topic || "Deep Work Sprint (via Copilot)");
        setSessionStartedAt(new Date().toISOString());
        setTimerStatus("Running");
      }
    };

    window.addEventListener("nix-start-focus", handleCopilotStart);
    return () => window.removeEventListener("nix-start-focus", handleCopilotStart);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerStatus === "Running") {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus]);

  const handleStart = () => {
    setTimerStatus("Running");
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());
  };

  const handlePause = () => {
    setTimerStatus("Paused");
  };

  const handleReset = () => {
    setTimerStatus("Paused");
    setSecondsLeft(plannedMinutes * 60);
    setSessionStartedAt(null);
  };

  const handlePresetSelect = (mins: number) => {
    setPlannedMinutes(mins);
    setSecondsLeft(mins * 60);
    setTimerStatus("Paused");
    setSessionStartedAt(null);
  };

  const handleCompleteSession = () => {
    setTimerStatus("Finished");
    const actualMins = Math.max(1, Math.round((plannedMinutes * 60 - secondsLeft) / 60) || plannedMinutes);

    nixStorage.saveFocusSession({
      taskId: selectedTaskId || undefined,
      projectId: selectedProjectId || undefined,
      plannedMinutes,
      actualMinutes: actualMins,
      startedAt: sessionStartedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "Finished",
      note: sessionNote || "Completed focus sprint",
    });

    setSessionNote("");
    setSessionStartedAt(null);
    refresh();
  };

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = secondsLeft % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, "0")}:${String(secondsDisplay).padStart(2, "0")}`;

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.actualMinutes || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-400" /> FOCUS SPRINT & POMODORO TIMER
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Sustain uninterrupted deep work, link active tasks, and accumulate focus points.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 font-bold">
          Total Deep Work: {totalFocusMinutes} mins
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Timer Block */}
        <NixCard className="md:col-span-2 flex flex-col items-center justify-center p-8 space-y-6 text-center">
          {/* Preset Buttons & Custom Duration */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[5, 10, 15, 25, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handlePresetSelect(mins)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  plannedMinutes === mins
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {mins}m
              </button>
            ))}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs font-mono">
              <span className="text-slate-400 text-[10px]">Custom:</span>
              <input
                type="number"
                min={1}
                max={720}
                value={plannedMinutes}
                onChange={(e) => {
                  const val = Math.min(720, Math.max(1, Number(e.target.value) || 1));
                  handlePresetSelect(val);
                }}
                className="w-12 bg-transparent text-slate-100 text-xs font-bold text-center focus:outline-none"
              />
              <span className="text-slate-400 text-[10px]">m</span>
            </div>
          </div>

          {/* Large Digital Clock Display */}
          <div className="text-7xl font-mono font-extrabold text-slate-100 tracking-tight my-4 glow-indigo-sm font-numeric">
            {formattedTime}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {timerStatus === "Running" ? (
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-mono font-bold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Pause className="w-5 h-5 fill-slate-950" /> Pause Sprint
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-2xl font-mono font-extrabold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Play className="w-5 h-5 fill-slate-950" /> Start Sprint
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-2xl transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleCompleteSession}
              className="px-4 py-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-2xl font-mono text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Log
            </button>
          </div>

          {/* Context Linking */}
          <div className="w-full max-w-md space-y-3 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 text-left">Link Active Task</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
              >
                <option value="">-- No Linked Task --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.priority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1 text-left">Link Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
              >
                <option value="">-- No Linked Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Session note or goal..."
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
            />
          </div>
        </NixCard>

        {/* History Log Column */}
        <NixCard className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Timer className="w-4 h-4" /> Recent Focus Sessions
          </h3>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px]">
            {sessions.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 text-center py-8">No focus sessions recorded yet.</p>
            ) : (
              sessions.slice(0, 8).map((s) => {
                const linkedTask = tasks.find((t) => t.id === s.taskId);
                return (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{s.actualMinutes}m Sprint</span>
                      <span className="text-emerald-400">+{s.actualMinutes * 2} pts</span>
                    </div>
                    {linkedTask && <p className="text-[10px] text-cyan-400">Task: {linkedTask.title}</p>}
                    {s.note && <p className="text-[10px] text-slate-400">{s.note}</p>}
                    <div className="text-[9px] text-slate-500">{s.startedAt.substring(0, 16).replace("T", " ")}</div>
                  </div>
                );
              })
            )}
          </div>
        </NixCard>
      </div>
    </div>
  );
};
