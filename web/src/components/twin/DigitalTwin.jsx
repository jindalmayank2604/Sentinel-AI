import React from "react";
import { SectionHeader } from "../common/SectionHeader";
import { MetricCard } from "../common/MetricCard";
import { StatusBadge } from "../common/StatusBadge";
import { 
  GitFork, 
  Cpu, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  Sliders,
  Layers
} from "lucide-react";

export function DigitalTwin({
  frequency,
  damping,
  survival,
  signalHealth,
  modelData,
  onNavigate
}) {
  const isAnomaly = signalHealth?.label?.includes("anomaly") || signalHealth?.crest > 3.5;

  const pipelineStages = [
    {
      id: "WORKBENCH",
      title: "1. PHYSICS CIRCUIT MODEL",
      icon: Cpu,
      metrics: [
        { label: "Resonance f₀", value: `${frequency.toFixed(2)} Hz` },
        { label: "Damping ζ", value: damping.toFixed(4) }
      ],
      description: "RLC forward-Euler simulation calculates state transitions and resonance harmonics.",
      status: "healthy",
      badge: "ACTIVE SIMULATION"
    },
    {
      id: "SIGNAL LAB",
      title: "2. SENSOR DSP & FFT",
      icon: Activity,
      metrics: [
        { label: "Diagnosis", value: signalHealth?.status?.toUpperCase() || "NORMAL" },
        { label: "Confidence", value: `${((signalHealth?.confidence || 0.56) * 100).toFixed(0)}%` }
      ],
      description: "Single-sided Hann FFT amplitude spectrum and crest-factor anomaly extraction.",
      status: signalHealth?.status || "healthy",
      badge: "STREAMING TELEMETRY"
    },
    {
      id: "AI MODELS",
      title: "3. ML RUL PREDICTION",
      icon: BrainCircuit,
      metrics: [
        { label: "MAE Error", value: modelData?.mae_cycles ? `${modelData.mae_cycles.toFixed(1)} cycles` : "18.3 cycles" },
        { label: "Held-out Test", value: "100 engines" }
      ],
      description: "NASA C-MAPSS Ridge regression baseline predicting cycle degradation trajectory.",
      status: "healthy",
      badge: "PREDICTIVE MODEL"
    },
    {
      id: "RELIABILITY",
      title: "4. WEIBULL RELIABILITY",
      icon: ShieldCheck,
      metrics: [
        { label: "Survival R(t)", value: `${(survival * (isAnomaly ? 0.85 : 1.0) * 100).toFixed(1)}%` },
        { label: "Condition Factor", value: isAnomaly ? "0.85×" : "1.00×" }
      ],
      description: "Condition-coupled parametric survival hypothesis for warranty risk & maintenance planning.",
      status: isAnomaly ? "warning" : "healthy",
      badge: "RISK SCENARIO"
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <SectionHeader
        eyebrow="CROSS-MODULE DIGITAL TWIN ARCHITECTURE"
        title="Integrated Digital Twin Topology & Dataflow"
        description="Visualize the closed-loop telemetry pipeline: from low-level RLC circuit simulation to sensor DSP, AI remaining life regression, and condition-adjusted reliability."
      />

      {/* Interactive 4-Stage Connected Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              onClick={() => onNavigate(stage.id)}
              className="bg-[#0D141C] border border-[#1D2B35] hover:border-[#48E6D2] p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 group relative"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2 mb-3">
                  <span className="text-[9px] font-mono text-[#48E6D2] tracking-wider uppercase">
                    {stage.badge}
                  </span>
                  <StatusBadge status={stage.status} size="sm" />
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-[#111A23] border border-[#1D2B35] text-[#48E6D2] group-hover:border-[#48E6D2]/50 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#E6EDF3] tracking-wide font-sans">
                    {stage.title}
                  </h3>
                </div>

                <p className="text-[11px] text-[#8A98A6] leading-relaxed mb-4">
                  {stage.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {stage.metrics.map((m, mi) => (
                    <div key={mi} className="bg-[#111A23] p-2 border border-[#1D2B35]/60">
                      <span className="text-[9px] text-[#8A98A6] block truncate">{m.label}</span>
                      <span className="text-[#E6EDF3] font-semibold block mt-0.5 truncate">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1D2B35] flex items-center justify-between text-[10px] font-mono text-[#48E6D2] group-hover:underline">
                <span>OPEN MODULE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Synchronized Data Flow Summary Diagram */}
      <div className="bg-[#0D141C] border border-[#1D2B35] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#48E6D2]" />
            <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
              LIVE DIGITAL TWIN STATE SYNCHRONIZATION
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#48E6D2]">
            CONNECTED TOPOLOGY
          </span>
        </div>

        <div className="p-4 bg-[#111A23] border border-[#1D2B35] flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs text-center">
          <div className="p-3 bg-[#0D141C] border border-[#1D2B35] w-full lg:w-auto">
            <div className="text-[#48E6D2] text-[10px]">CIRCUIT MODEL</div>
            <div className="text-[#E6EDF3] mt-1 font-semibold">{frequency.toFixed(2)} Hz</div>
            <div className="text-[9px] text-[#8A98A6]">Resonant impulse</div>
          </div>

          <div className="text-[#48E6D2] font-bold">→</div>

          <div className="p-3 bg-[#0D141C] border border-[#1D2B35] w-full lg:w-auto">
            <div className="text-[#48E6D2] text-[10px]">SPECTRAL FFT</div>
            <div className="text-[#E6EDF3] mt-1 font-semibold">
              {signalHealth?.label || "Normal"}
            </div>
            <div className="text-[9px] text-[#8A98A6]">Peak anomaly detection</div>
          </div>

          <div className="text-[#48E6D2] font-bold">→</div>

          <div className="p-3 bg-[#0D141C] border border-[#1D2B35] w-full lg:w-auto">
            <div className="text-[#48E6D2] text-[10px]">AI RUL ENGINE</div>
            <div className="text-[#E6EDF3] mt-1 font-semibold">
              {modelData?.mae_cycles ? `${modelData.mae_cycles.toFixed(1)} cycles` : "NASA Baseline"}
            </div>
            <div className="text-[9px] text-[#8A98A6]">Sensor slope degradation</div>
          </div>

          <div className="text-[#48E6D2] font-bold">→</div>

          <div className="p-3 bg-[#0D141C] border border-[#1D2B35] w-full lg:w-auto">
            <div className="text-[#48E6D2] text-[10px]">RELIABILITY LAB</div>
            <div className="text-[#E6EDF3] mt-1 font-semibold">
              {(survival * (isAnomaly ? 0.85 : 1.0) * 100).toFixed(1)}% Survival
            </div>
            <div className="text-[9px] text-[#8A98A6]">Dynamic condition risk</div>
          </div>
        </div>
      </div>
    </div>
  );
}
