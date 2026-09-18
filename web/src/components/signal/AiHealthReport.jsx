import React from "react";
import { StatusBadge } from "../common/StatusBadge";
import { BrainCircuit, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function AiHealthReport({ diagnosis, features, onSendToReliability }) {
  if (!diagnosis) return null;

  const isHealthy = diagnosis.status === "healthy";
  const isWarning = diagnosis.status === "warning";
  const isCritical = diagnosis.status === "critical";

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-3">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-4 h-4 text-[#48E6D2]" />
          <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
            AI HEALTH SCREEN & PHYSICAL DIAGNOSTIC
          </h2>
        </div>
        <StatusBadge
          status={diagnosis.status}
          label={diagnosis.status.toUpperCase()}
          size="sm"
          pulse={!isHealthy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Conclusion and Confidence */}
        <div className="lg:col-span-2 bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
              RULE-BASED INFERENCE CONCLUSION
            </span>
            <div className="text-base sm:text-lg font-sans font-semibold text-[#E6EDF3]">
              {diagnosis.label}
            </div>
            <div className="text-xs text-[#8A98A6] mt-2 leading-relaxed">
              {diagnosis.uncertainty}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1D2B35] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-[#8A98A6]">Confidence Score</span>
            <span className="text-[#48E6D2] font-semibold text-sm">
              {(diagnosis.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Right: Next Experiment & Send to Reliability */}
        <div className="bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
              ENGINEERING ACTIONS
            </span>
            <div className="text-xs text-[#8A98A6] space-y-1.5">
              {diagnosis.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[#E6EDF3]">
                  <span className="text-[#48E6D2] mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onSendToReliability}
            className="w-full mt-4 py-2 bg-[#48E6D2] hover:bg-[#3cd3bf] text-[#070B11] font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(72,230,210,0.2)]"
          >
            <span>SEND TO RELIABILITY</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Physics Evidence Points */}
      <div className="bg-[#111A23]/50 border border-[#1D2B35] p-3">
        <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1.5">
          EVIDENCE METRICS & SPECTRAL EXTRACTS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#0D141C] p-2 border border-[#1D2B35]">
            <span className="text-[9px] text-[#8A98A6] block">RMS ENERGY</span>
            <span className="text-[#E6EDF3] font-semibold">{features.rms.toFixed(4)}</span>
          </div>
          <div className="bg-[#0D141C] p-2 border border-[#1D2B35]">
            <span className="text-[9px] text-[#8A98A6] block">CREST FACTOR (PEAK/RMS)</span>
            <span className={`font-semibold ${features.crestFactor > 3.5 ? "text-[#F59E0B]" : "text-[#48E6D2]"}`}>
              {features.crestFactor.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#0D141C] p-2 border border-[#1D2B35]">
            <span className="text-[9px] text-[#8A98A6] block">DOMINANT FREQ</span>
            <span className="text-[#E6EDF3] font-semibold">{features.dominantFreq.toFixed(1)} Hz</span>
          </div>
          <div className="bg-[#0D141C] p-2 border border-[#1D2B35]">
            <span className="text-[9px] text-[#8A98A6] block">HIGH-FREQ ENERGY</span>
            <span className="text-[#E6EDF3] font-semibold">{(features.highFreqRatio * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
