import React from "react";
import { Database, Binary, CheckCircle2, ChevronRight } from "lucide-react";

export function PipelineSteps() {
  const steps = [
    {
      step: "01",
      icon: Database,
      title: "RUN-TO-FAILURE TRAJECTORIES",
      detail: "30-cycle sliding sensor windows extracted from FD001 turbofan engines that operated until complete operational failure."
    },
    {
      step: "02",
      icon: Binary,
      title: "RIDGE REGRESSION MODEL",
      detail: "Inspectable closed-form Ridge regression learns sensor trend slopes, means, and variances across 21 sensor channels."
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "HELD-OUT ENGINE VALIDATION",
      detail: "100 completely unseen test engine trajectories evaluated against NASA ground-truth remaining useful life (capped at 125 cycles)."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.step}
            className="bg-[#0D141C] border border-[#1D2B35] p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-[#48E6D2]/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold text-[#48E6D2]">
                {s.step}
              </span>
              <Icon className="w-4 h-4 text-[#8A98A6] group-hover:text-[#48E6D2] transition-colors" />
            </div>

            <div>
              <div className="text-xs font-sans font-semibold text-[#E6EDF3] tracking-wide mb-1.5">
                {s.title}
              </div>
              <p className="text-[11px] text-[#8A98A6] leading-relaxed">
                {s.detail}
              </p>
            </div>

            <div className="h-0.5 w-full bg-[#111A23] group-hover:bg-[#48E6D2]/40 transition-colors"></div>
          </div>
        );
      })}
    </div>
  );
}
