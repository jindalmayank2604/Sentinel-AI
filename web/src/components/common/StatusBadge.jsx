import React from "react";

export function StatusBadge({
  status = "healthy", // 'healthy' | 'warning' | 'critical' | 'neutral' | 'active'
  label,
  showDot = true,
  pulse = false,
  size = "md", // 'sm' | 'md'
  onClick = null
}) {
  const configs = {
    healthy: {
      bg: "bg-[#22C55E]/10",
      border: "border-[#22C55E]/30",
      text: "text-[#22C55E]",
      dot: "bg-[#22C55E]",
      defaultLabel: "OPERATIONAL"
    },
    warning: {
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/30",
      text: "text-[#F59E0B]",
      dot: "bg-[#F59E0B]",
      defaultLabel: "WARNING"
    },
    critical: {
      bg: "bg-[#EF4444]/10",
      border: "border-[#EF4444]/30",
      text: "text-[#EF4444]",
      dot: "bg-[#EF4444]",
      defaultLabel: "CRITICAL"
    },
    active: {
      bg: "bg-[#48E6D2]/10",
      border: "border-[#48E6D2]/30",
      text: "text-[#48E6D2]",
      dot: "bg-[#48E6D2]",
      defaultLabel: "ONLINE"
    },
    neutral: {
      bg: "bg-[#111A23]",
      border: "border-[#1D2B35]",
      text: "text-[#8A98A6]",
      dot: "bg-[#8A98A6]",
      defaultLabel: "STANDBY"
    }
  };

  const current = configs[status] || configs.neutral;
  const displayLabel = label || current.defaultLabel;

  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-[10px]" 
    : "px-2.5 py-1 text-[11px]";

  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider border rounded-none transition-all duration-150 ${current.bg} ${current.border} ${current.text} ${sizeClasses} ${onClick ? "hover:brightness-125 cursor-pointer" : ""}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${current.dot}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 ${current.dot}`} />
        </span>
      )}
      <span>{displayLabel}</span>
    </Component>
  );
}
