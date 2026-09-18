import React from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions = null,
  className = ""
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1D2B35] ${className}`}>
      <div>
        {eyebrow && (
          <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#48E6D2] uppercase mb-1">
            {eyebrow}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#E6EDF3] font-sans">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#8A98A6] mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
