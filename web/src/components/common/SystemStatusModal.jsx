import React from "react";
import { StatusBadge } from "./StatusBadge";
import { Cpu, Activity, BrainCircuit, ShieldCheck, CheckCircle2, AlertTriangle, X } from "lucide-react";

export function SystemStatusModal({ isOpen, onClose, subsystems }) {
  if (!isOpen) return null;

  const defaultSubsystems = [
    {
      name: "Circuit Engine",
      icon: Cpu,
      status: "healthy",
      latency: "< 1 ms",
      description: "2D graph topology & forward-Euler state integrator active."
    },
    {
      name: "Signal Processor",
      icon: Activity,
      status: "healthy",
      latency: "2.4 ms",
      description: "Radix-2 FFT spectral analyzer and physics-based rule screener online."
    },
    {
      name: "AI Pipeline",
      icon: BrainCircuit,
      status: subsystems?.aiStatus || "healthy",
      latency: "Local Python / Client",
      description: "NASA C-MAPSS Ridge regression remaining life model ready."
    },
    {
      name: "Reliability Engine",
      icon: ShieldCheck,
      status: "healthy",
      latency: "< 1 ms",
      description: "Parametric Weibull hazard calculator & condition-coupling active."
    }
  ];

  const list = subsystems?.items || defaultSubsystems;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0D141C] border border-[#2E4252] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1D2B35] bg-[#111A23]/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-none bg-[#22C55E] animate-pulse"></span>
            <h2 className="text-sm font-semibold font-sans tracking-wide text-[#E6EDF3]">
              SENTINEL SYSTEM DIAGNOSTICS
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8A98A6] hover:text-[#E6EDF3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {list.map((sub, idx) => {
            const Icon = sub.icon || Cpu;
            return (
              <div 
                key={idx}
                className="p-3.5 bg-[#111A23] border border-[#1D2B35] flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#0D141C] border border-[#1D2B35] text-[#48E6D2] mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold font-sans text-[#E6EDF3] flex items-center gap-2">
                      {sub.name}
                      <span className="text-[10px] font-mono text-[#8A98A6] font-normal">
                        ({sub.latency})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A98A6] mt-0.5 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>
                <StatusBadge status={sub.status} size="sm" />
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 bg-[#070B11] border-t border-[#1D2B35] flex items-center justify-between text-[11px] font-mono text-[#8A98A6]">
          <span>ENVIRONMENT: LOCAL-FIRST PRODUCTION</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-[#111A23] border border-[#1D2B35] text-[#E6EDF3] hover:border-[#48E6D2] text-xs font-mono"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
