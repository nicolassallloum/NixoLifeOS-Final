import React, { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  History,
  Wallet,
  Activity,
  Timer,
  FolderKanban,
  CheckSquare,
  Target,
  Repeat,
  FileText,
  Zap,
  ExternalLink,
} from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { NixCard } from "../ui/NixUi";
import { CopilotProposal, executeCopilotProposal, CopilotExecutionResult } from "../../lib/copilotExecutor";
import { authenticatedFetch } from "../../lib/api";

export const CopilotView: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<CopilotProposal | null>(null);
  const [summary, setSummary] = useState("");
  const [executionResult, setExecutionResult] = useState<CopilotExecutionResult | null>(null);
  const [history, setHistory] = useState<Array<{ prompt: string; result: CopilotExecutionResult; time: string }>>([]);

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
            tasksCount: nixStorage.getTasks().length,
            projectsCount: nixStorage.getProjects().length,
            accountsCount: nixStorage.getAccounts().length,
            medicationsCount: nixStorage.getMedications().length,
            habitsCount: nixStorage.getHabits().length,
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
      console.error(err);
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

    setHistory((prev) => [
      { prompt: prompt || summary, result, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);

    setProposal(null);
    setPrompt("");
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
      default:
        return <CheckSquare className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Nix Copilot Universal AI Assistant</span>
          </div>
          <h1 className="text-2xl font-mono font-extrabold text-slate-100">ALL-MODULE AI COMMAND CENTER</h1>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-2xl">
            Control your entire life OS with natural language commands. Seamlessly log expenses, record incomes, take medications, start focus timers, launch strategic projects, set goals, check in habits, and capture knowledge.
          </p>
        </div>
      </div>

      {/* Natural Language Prompt Input */}
      <NixCard>
        <div className="space-y-3">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-cyan-400">
            Natural Language Life OS Prompt
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskCopilot()}
              placeholder='e.g. "I take my medication now", "Add $45 expense for groceries", "Start 25m focus sprint", "Create Project: Cloud Architecture"'
              className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-hidden"
            />
            <button
              onClick={() => handleAskCopilot()}
              disabled={loading || !prompt.trim()}
              className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="animate-spin text-xs">⏳</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Example Triggers */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> One-Click Actions:
            </span>
            {[
              { label: "💊 I took my medication now", text: "I take my medication now" },
              { label: "💰 Add $35 lunch expense", text: "Spent $35 on lunch at cafe" },
              { label: "💵 Record $2,800 salary", text: "Record income of $2800 from consulting" },
              { label: "⏱️ Start 25m Deep Work timer", text: "Start a 25-minute focus timer on Architecture" },
              { label: "📁 Create Project: Platform Redesign", text: "Create high priority project: Platform Redesign" },
              { label: "🎯 Set Goal: Save $5,000", text: "Set Goal: Save $5000 in savings" },
              { label: "🌿 Check in Morning Workout", text: "Log habit: Morning Workout" },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(ex.text);
                  handleAskCopilot(ex.text);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </NixCard>

      {/* Execution Status Feedback */}
      {executionResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs space-y-1 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Success: Action Committed to Nix OS</span>
          </div>
          <p className="text-slate-300 text-[11px]">{executionResult.message}</p>
        </div>
      )}

      {/* Structured Proposal Confirmation Card */}
      {proposal && (
        <NixCard className="border-2 border-cyan-500/50 bg-slate-950 space-y-4 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs font-mono">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Copilot Proposed Action (Confirmation Required)</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-full">
              Confidence: {Math.round((proposal.confidence || 0.95) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              {getModuleIcon(proposal.type)}
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Target: {proposal.type || "General"}
              </span>
              <h3 className="text-sm font-mono font-bold text-slate-100 mt-1">{summary}</h3>
            </div>
          </div>

          {/* Structured Details Preview */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            {proposal.title && (
              <div className="flex justify-between">
                <span className="text-slate-400">Title / Subject:</span>
                <span className="font-bold text-cyan-300">{proposal.title}</span>
              </div>
            )}
            {proposal.medicationName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Medication Name:</span>
                <span className="font-bold text-rose-300">{proposal.medicationName}</span>
              </div>
            )}
            {proposal.amount !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-300">${proposal.amount.toFixed(2)}</span>
              </div>
            )}
            {proposal.minutes && (
              <div className="flex justify-between">
                <span className="text-slate-400">Sprint Duration:</span>
                <span className="font-bold text-indigo-300">{proposal.minutes} Minutes</span>
              </div>
            )}
            {proposal.priority && (
              <div className="flex justify-between">
                <span className="text-slate-400">Priority Level:</span>
                <span className="font-bold text-amber-300">{proposal.priority}</span>
              </div>
            )}
            {proposal.category && (
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-200">{proposal.category}</span>
              </div>
            )}
            {proposal.dueDate && (
              <div className="flex justify-between">
                <span className="text-slate-400">Target Date:</span>
                <span className="font-bold text-slate-200">{proposal.dueDate}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setProposal(null)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
            >
              Reject Proposal
            </button>
            <button
              onClick={handleConfirmAndExecute}
              className="px-5 py-2 rounded-xl text-xs font-mono font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Execute</span>
            </button>
          </div>
        </NixCard>
      )}

      {/* Execution History */}
      {history.length > 0 && (
        <NixCard>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 mb-3">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Recent Copilot Executions ({history.length})</span>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">"{h.prompt}"</div>
                  <div className="text-[11px] text-slate-400">{h.result.message}</div>
                </div>
                <span className="text-[10px] text-slate-500">{h.time}</span>
              </div>
            ))}
          </div>
        </NixCard>
      )}
    </div>
  );
};
