import React from "react";

interface NixCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const NixCard: React.FC<NixCardProps> = ({ children, className = "", hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md text-slate-100 shadow-sm transition-all duration-200 ${
        hoverable ? "hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface NixMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export const NixMetricCard: React.FC<NixMetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  accentColor = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
  className = "",
}) => {
  return (
    <NixCard className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-cyan-400/90">
          {title}
        </span>
        {icon && <div className={`p-2.5 rounded-xl ${accentColor}`}>{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-mono font-bold text-slate-100 tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {change && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </NixCard>
  );
};

interface NixProgressBarProps {
  progress: number;
  colorClass?: string;
  showLabel?: boolean;
  heightClass?: string;
}

export const NixProgressBar: React.FC<NixProgressBarProps> = ({
  progress,
  colorClass = "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
  showLabel = true,
  heightClass = "h-2",
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5 font-medium">
          <span>PROGRESS</span>
          <span className="text-cyan-400 font-bold">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export const NixStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = "bg-slate-900 text-slate-300 border border-slate-800";

  if (["Active", "In Progress", "On Track"].includes(status)) {
    color = "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.2)]";
  } else if (["Finished", "Completed", "Achieved"].includes(status)) {
    color = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
  } else if (["At Risk", "Blocked", "Attention Needed"].includes(status)) {
    color = "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]";
  } else if (["Planned", "Pending"].includes(status)) {
    color = "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold ${color}`}>
      {status}
    </span>
  );
};

export const NixPriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  let color = "bg-slate-900 text-slate-400 border border-slate-800";

  if (priority === "Urgent") color = "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-[0_0_8px_rgba(244,63,94,0.2)]";
  else if (priority === "High") color = "bg-amber-500/20 text-amber-300 border border-amber-500/40";
  else if (priority === "Medium") color = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${color}`}>
      {priority}
    </span>
  );
};

interface NixModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const NixModal: React.FC<NixModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-[0_0_30px_rgba(2,6,23,0.8)] relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-mono tracking-[0.15em] uppercase text-cyan-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse glow-cyan-sm" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-400 text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

