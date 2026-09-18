import React from "react";
import { Activity, ShieldAlert, Cpu, CheckCircle2, ArrowRight } from "lucide-react";

export function ConditionAdjustment({ signalHealth, frequency, onNavigate }) {
  const isAnomaly = signalHealth?.label?.includes("anomaly") || signalHealth?.crest > 3.5;
  const conditionFactor = isAnomaly ? 0.85 : 1.0;

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#48E6D2]" />
          <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
            LIVE SIGNAL HEALTH COUPLING & EVIDENCE
          </h2>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 border ${
          isAnomaly
            ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
            : "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
        }`}>
          FACTOR: {conditionFactor.toFixed(2)}×
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
              LATEST SIGNAL DIAGNOSIS
            </span>
            <div className="text-sm font-semibold text-[#E6EDF3]">
              {signalHealth?.label || "Normal operation / no strong rule-based concern"}
            </div>
            <p className="text-[11px] text-[#8A98A6] mt-2">
              Source: {signalHealth?.source || "Synthetic sine"} • Confidence: {((signalHealth?.confidence || 0.56) * 100).toFixed(0)}% • Crest Factor: {signalHealth?.crest ? signalHealth.crest.toFixed(2) : "1.41"}
            </p>
          </div>
          <button
            onClick={() => onNavigate("SIGNAL LAB")}
            className="mt-3 text-[11px] font-mono text-[#48E6D2] hover:underline flex items-center gap-1"
          >
            Review waveform in Signal Lab →
          </button>
        </div>

        <div className="bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
              CIRCUIT WORKBENCH COUPLING
            </span>
            <div className="text-sm font-semibold text-[#E6EDF3]">
              Active RLC Resonance: {frequency.toFixed(2)} Hz
            </div>
            <p className="text-[11px] text-[#8A98A6] mt-2">
              Resonance and damping ratio shifts serve as dynamic condition evidence to recalibrate Weibull survival assumptions.
            </p>
          </div>
          <button
            onClick={() => onNavigate("WORKBENCH")}
            className="mt-3 text-[11px] font-mono text-[#48E6D2] hover:underline flex items-center gap-1"
          >
            Adjust RLC Parameters in Workbench →
          </button>
        </div>
      </div>
    </div>
  );
}
