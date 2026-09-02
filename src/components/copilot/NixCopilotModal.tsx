import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  X,
  Wallet,
  Activity,
  Timer,
  FolderKanban,
  CheckSquare,
  Target,
  Repeat,
  FileText,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mic,
  MicOff,
  History,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { CopilotProposal, executeCopilotProposal, CopilotExecutionResult } from "../../lib/copilotExecutor";
import { authenticatedFetch } from "../../lib/api";

interface NixCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute?: string;
  onRouteChange?: (routeId: string) => void;
}

export const NixCopilotModal: React.FC<NixCopilotModalProps> = ({
  isOpen,
  onClose,
  currentRoute = "dashboard",
  onRouteChange,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<CopilotProposal | null>(null);
  const [summary, setSummary] = useState("");
  const [executionResult, setExecutionResult] = useState<CopilotExecutionResult | null>(null);
  const [recentHistory, setRecentHistory] = useState<Array<{ prompt: string; result: CopilotExecutionResult; time: string }>>([]);
  const [activeTab, setActiveTab] = useState<"copilot" | "history">("copilot");
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setProposal(null);
      setExecutionResult(null);
    }
  }, [isOpen]);

  // Context-aware suggestions depending on the user's active page
  const getContextSuggestions = () => {
    switch (currentRoute) {
      case "finance":
        return [
          { label: "💰 Add $45 grocery expense", text: "Add $45 expense for groceries at Supermarket" },
          { label: "💵 Record $3,500 salary income", text: "Record income of $3500 from Monthly Salary" },
          { label: "☕ Log $4.50 coffee", text: "Spent $4.50 on morning coffee" },
        ];
      case "health":
        return [
          { label: "💊 I took my medication now", text: "I take my medication now" },
          { label: "💧 Log 750ml water", text: "Log 750ml water intake" },
          { label: "🩺 Log BP 120/80", text: "Log blood pressure 120/80" },
        ];
      case "focus":
        return [
          { label: "⏱️ Start 25m Focus Sprint", text: "Start a 25-minute focus sprint on Core Architecture" },
          { label: "🔥 45m Deep Work timer", text: "Start 45m deep work timer" },
          { label: "⚡ 15m Quick Sprint", text: "Start 15m sprint on task backlog" },
        ];
      case "projects":
        return [
          { label: "📁 Create Project: Mobile App Launch", text: "Create high priority project: Mobile App Launch due in 3 weeks" },
          { label: "🚀 Start Project: Brand Refresh", text: "Create project: Brand Refresh with Medium priority" },
        ];
      case "tasks":
        return [
          { label: "✅ Add urgent task: Review API Docs", text: "Add urgent task: Review API Docs by tomorrow" },
          { label: "📝 Remind me to call accountant", text: "Remind me to call accountant on Friday" },
        ];
      case "goals":
        return [
          { label: "🎯 Set Goal: Save $5,000", text: "Set Goal: Save $5000 in Emergency Fund" },
          { label: "🏃 Set Goal: Run 50km", text: "Set Health Goal: Run 50km this month" },
        ];
      case "habits":
        return [
          { label: "🌿 Check in Morning Meditation", text: "Checked in Morning Meditation habit today" },
          { label: "💧 Check in Drink 2L Water", text: "Log habit: Drink 2L Water" },
        ];
      case "notes":
        return [
          { label: "🗒️ Create Note: Architecture Ideas", text: "Create note: Architecture Ideas for Q4 roadmap" },
        ];
      default:
        return [
          { label: "💊 I took my medication now", text: "I take my medication now" },
          { label: "💰 Spent $35 on lunch", text: "Spent $35 on client lunch" },
          { label: "⏱️ Start 25m Deep Work timer", text: "Start a 25 minute focus sprint" },
          { label: "📁 Create Project: NextGen Platform", text: "Create project: NextGen Platform with High priority" },
        ];
    }
  };

  const handleAskCopilot = async (overridePrompt?: string) => {
    const textToQuery = overridePrompt || prompt;
    if (!textToQuery.trim()) return;

    setLoading(true);
    setProposal(null);
    setExecutionResult(null);

    try {
      const response = await authenticatedFetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToQuery,
          context: {
            currentRoute,
            tasksCount: nixStorage.getTasks().length,
            projectsCount: nixStorage.getProjects().length,
            accountsCount: nixStorage.getAccounts().length,
            medicationsCount: nixStorage.getMedications().length,
          },
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setProposal(resData.data.proposal);
        setSummary(resData.data.summary || "Proposed Action");
      } else {
        // Fallback local execution
        const res = executeCopilotProposal({ type: "task", title: textToQuery }, textToQuery);
        setExecutionResult(res);
      }
    } catch (err) {
      console.error("Copilot fetch error:", err);
      // Fallback local execution
      const res = executeCopilotProposal({ type: "task", title: textToQuery }, textToQuery);
      setExecutionResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndExecute = () => {
    if (!proposal) return;

    const result = executeCopilotProposal(proposal, prompt);
    setExecutionResult(result);

    // Save to history
    setRecentHistory((prev) => [
      { prompt: prompt || summary, result, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);

    setProposal(null);
    setPrompt("");
  };

  const handleVoiceToggle = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser environment.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      if (!isListening) {
        setIsListening(true);
        recognition.start();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsListening(false);
          handleAskCopilot(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } else {
        setIsListening(false);
        recognition.stop();
      }
    } catch {
      setIsListening(false);
    }
  };

  const getModuleIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "expense":
      case "income":
      case "finance":
        return <Wallet className="w-5 h-5 text-emerald-400" />;
      case "medication":
      case "health":
        return <Activity className="w-5 h-5 text-rose-400" />;
      case "focus":
        return <Timer className="w-5 h-5 text-rose-500" />;
      case "project":
        return <FolderKanban className="w-5 h-5 text-blue-400" />;
      case "goal":
        return <Target className="w-5 h-5 text-emerald-400" />;
      case "habit":
        return <Repeat className="w-5 h-5 text-teal-400" />;
      case "note":
        return <FileText className="w-5 h-5 text-amber-400" />;
      case "study":
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case "career":
        return <Briefcase className="w-5 h-5 text-sky-400" />;
      default:
        return <CheckSquare className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getModuleBadgeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "expense":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "income":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "medication":
      case "health":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "focus":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "project":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "goal":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "habit":
        return "bg-teal-500/20 text-teal-300 border-teal-500/40";
      default:
        return "bg-violet-500/20 text-violet-300 border-violet-500/40";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glowing Top Ambient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-extrabold text-sm text-slate-100 tracking-wider">
                  NIX COPILOT AI ENGINE
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                  Active in {currentRoute}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Universal Command Center across Expenses, Health, Focus, Projects & Tasks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setActiveTab("copilot")}
                className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors ${
                  activeTab === "copilot"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Assistant
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === "history"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <History className="w-3 h-3" />
                <span>History ({recentHistory.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "copilot" ? (
            <>
              {/* Natural Input Box */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskCopilot()}
                    placeholder='e.g. "I take my medication now", "Add $45 grocery expense", "Start 25m focus timer", "Create Project: Mobile App"'
                    className="w-full pl-4 pr-24 py-3.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-2xl text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-hidden shadow-inner"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`p-2 rounded-xl transition-colors ${
                        isListening
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                          : "text-slate-500 hover:text-cyan-400 hover:bg-slate-800"
                      }`}
                      title={isListening ? "Listening..." : "Voice input"}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskCopilot()}
                      disabled={loading || !prompt.trim()}
                      className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <span className="animate-spin text-xs">⏳</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Run</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Context Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mr-1">
                    <Zap className="w-3 h-3 text-cyan-400" /> Suggestions:
                  </span>
                  {getContextSuggestions().map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(sugg.text);
                        handleAskCopilot(sugg.text);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                    >
                      {sugg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Success Alert */}
              {executionResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Action Executed Successfully</span>
                    </div>
                    {onRouteChange && (
                      <button
                        onClick={() => {
                          onRouteChange(executionResult.targetModule);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Open {executionResult.targetModule}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px]">{executionResult.message}</p>
                </div>
              )}

              {/* Structured AI Proposal Confirmation Card */}
              {proposal && (
                <div className="p-5 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 space-y-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {getModuleIcon(proposal.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getModuleBadgeColor(
                              proposal.type
                            )}`}
                          >
                            {proposal.type || "Action"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Confidence: {Math.round((proposal.confidence || 0.95) * 100)}%
                          </span>
                        </div>
                        <h4 className="text-xs font-mono font-bold text-slate-100 mt-1">
                          {summary}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Key Parameter Preview Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    {proposal.title && (
                      <div className="col-span-2 flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Title / Subject:</span>
                        <span className="font-bold text-cyan-300">{proposal.title}</span>
                      </div>
                    )}
                    {proposal.medicationName && (
                      <div className="col-span-2 flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Medication:</span>
                        <span className="font-bold text-rose-300">{proposal.medicationName}</span>
                      </div>
                    )}
                    {proposal.amount !== undefined && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Amount:</span>
                        <span className="font-bold text-emerald-300">${proposal.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {proposal.minutes && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-bold text-indigo-300">{proposal.minutes} Minutes</span>
                      </div>
                    )}
                    {proposal.category && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Category:</span>
                        <span className="font-bold text-slate-200">{proposal.category}</span>
                      </div>
                    )}
                    {proposal.priority && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Priority:</span>
                        <span className="font-bold text-amber-300">{proposal.priority}</span>
                      </div>
                    )}
                    {proposal.dueDate && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Due Date:</span>
                        <span className="font-bold text-slate-200">{proposal.dueDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => setProposal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleConfirmAndExecute}
                      className="px-5 py-2 rounded-xl text-xs font-mono font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Execute</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Supported Domains Grid */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Integrated OS Domains & Capabilities
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { title: "Finance", desc: "Expenses & Incomes", icon: <Wallet className="w-4 h-4 text-emerald-400" /> },
                    { title: "Health", desc: "Meds & Vitals", icon: <Activity className="w-4 h-4 text-rose-400" /> },
                    { title: "Focus Timer", desc: "Pomodoros & Sprints", icon: <Timer className="w-4 h-4 text-rose-500" /> },
                    { title: "Projects", desc: "Milestones & Tasks", icon: <FolderKanban className="w-4 h-4 text-blue-400" /> },
                    { title: "Tasks", desc: "Priorities & Due Dates", icon: <CheckSquare className="w-4 h-4 text-indigo-400" /> },
                    { title: "Goals", desc: "Measurable Targets", icon: <Target className="w-4 h-4 text-emerald-400" /> },
                    { title: "Habits", desc: "Daily Streaks", icon: <Repeat className="w-4 h-4 text-teal-400" /> },
                    { title: "Notes", desc: "Knowledge Vault", icon: <FileText className="w-4 h-4 text-amber-400" /> },
                  ].map((dom, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-left"
                    >
                      {dom.icon}
                      <div>
                        <div className="text-[11px] font-mono font-bold text-slate-200">{dom.title}</div>
                        <div className="text-[9px] font-mono text-slate-500">{dom.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {recentHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No previous Copilot commands recorded in this session.
                </div>
              ) : (
                recentHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-300 font-bold">"{item.prompt}"</span>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.result.message}</p>
                    {onRouteChange && (
                      <button
                        onClick={() => {
                          onRouteChange(item.result.targetModule);
                          onClose();
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <span>Go to {item.result.targetModule}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
