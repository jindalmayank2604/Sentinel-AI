import React from "react";

export function MetricCard({
  label,
  value,
  unit = "",
  note,
  status = "neutral", // 'neutral' | 'healthy' | 'warning' | 'critical' | 'cyan'
  sparkline = null,
  trend = null, // e.g. { direction: 'up' | 'down', text: '+2.4%' }
  className = ""
}) {
  const statusColorMap = {
    neutral: "border-[#1D2B35] hover:border-[#2E4252] text-[#E6EDF3]",
    cyan: "border-[#48E6D2]/30 hover:border-[#48E6D2] text-[#48E6D2]",
    healthy: "border-[#22C55E]/30 hover:border-[#22C55E] text-[#22C55E]",
    warning: "border-[#F59E0B]/30 hover:border-[#F59E0B] text-[#F59E0B]",
    critical: "border-[#EF4444]/30 hover:border-[#EF4444] text-[#EF4444]"
  };

  const badgeBgMap = {
    neutral: "bg-[#111A23] text-[#8A98A6]",
    cyan: "bg-[#48E6D2]/10 text-[#48E6D2]",
    healthy: "bg-[#22C55E]/10 text-[#22C55E]",
    warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
    critical: "bg-[#EF4444]/10 text-[#EF4444]"
  };

  return (
    <div
      className={`relative group bg-[#0D141C] border p-4 sm:p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between ${statusColorMap[status] || statusColorMap.neutral} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-[#8A98A6] uppercase truncate">
          {label}
        </span>
        {trend && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${badgeBgMap[status]}`}>
            {trend.direction === "up" ? "↑" : "↓"} {trend.text}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-xl sm:text-2xl lg:text-3xl font-mono font-semibold tracking-tight text-[#E6EDF3] select-all">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-mono text-[#8A98A6] font-normal">
            {unit}
          </span>
        )}
      </div>

      {note && (
        <div className="text-[11px] font-mono text-[#8A98A6] mt-2 flex items-center justify-between border-t border-[#1D2B35]/60 pt-2 truncate">
          <span className="truncate">{note}</span>
          {sparkline && <div className="w-12 h-3 opacity-60 group-hover:opacity-100">{sparkline}</div>}
        </div>
      )}
    </div>
  );
}
