import React from "react";

export function LoadingSkeleton({ variant = "card", rows = 3, className = "" }) {
  if (variant === "chart") {
    return (
      <div className={`w-full h-64 bg-[#0D141C] border border-[#1D2B35] p-6 flex flex-col justify-between animate-pulse ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-[#111A23]"></div>
          <div className="h-3 w-16 bg-[#111A23]"></div>
        </div>
        <div className="space-y-4 my-auto">
          <div className="h-1 w-full bg-[#1D2B35]/40"></div>
          <div className="h-1 w-full bg-[#1D2B35]/40"></div>
          <div className="h-1 w-full bg-[#1D2B35]/40"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-12 bg-[#111A23]"></div>
          <div className="h-3 w-12 bg-[#111A23]"></div>
          <div className="h-3 w-12 bg-[#111A23]"></div>
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`w-full bg-[#0D141C] border border-[#1D2B35] p-4 animate-pulse ${className}`}>
        <div className="h-6 w-1/3 bg-[#111A23] mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-1/4 bg-[#111A23]"></div>
              <div className="h-4 w-1/2 bg-[#111A23]"></div>
              <div className="h-4 w-1/4 bg-[#111A23]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0D141C] border border-[#1D2B35] p-5 space-y-3 animate-pulse ${className}`}>
      <div className="h-3 w-24 bg-[#111A23]"></div>
      <div className="h-7 w-36 bg-[#111A23]"></div>
      <div className="h-3 w-48 bg-[#111A23]/60"></div>
    </div>
  );
}

export function OperationProgress({ label, status = "Processing", progress = null }) {
  return (
    <div className="bg-[#0D141C] border border-[#48E6D2]/40 p-4 sm:p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-[#48E6D2] border-t-transparent animate-spin"></div>
        <div>
          <div className="text-xs font-mono text-[#E6EDF3]">{label}</div>
          <div className="text-[11px] font-mono text-[#48E6D2]">{status}...</div>
        </div>
      </div>
      {progress !== null && (
        <span className="font-mono text-sm font-semibold text-[#48E6D2]">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
