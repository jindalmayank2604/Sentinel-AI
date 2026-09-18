import React from "react";
import { MetricCard } from "../common/MetricCard";
import { SectionHeader } from "../common/SectionHeader";
import { StatusBadge } from "../common/StatusBadge";
import { 
  Cpu, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Zap
} from "lucide-react";

export function OverviewDashboard({
  onNavigate,
  frequency,
  damping,
  survival,
  signalHealth,
  modelData,
  circuitPreset,
  history = []
}) {
  const isHealthy = (signalHealth?.status || "healthy") === "healthy";
  const dampingStatus = damping < 1 ? "Underdamped (oscillatory)" : damping === 1 ? "Critically damped" : "Overdamped";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner / System Hero */}
      <div className="relative bg-gradient-to-r from-[#0D141C] via-[#111A23] to-[#0D141C] border border-[#1D2B35] p-5 sm:p-7 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#48E6D2]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#48E6D2] uppercase bg-[#48E6D2]/10 px-2 py-0.5 border border-[#48E6D2]/20">
              <Zap className="w-3 h-3 text-[#48E6D2]" />
              ENGINEERING INTELLIGENCE & TELEMETRY
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#E6EDF3] font-sans">
              Autonomous Systems & Physics Health Monitor
            </h1>
            <p className="text-xs sm:text-sm text-[#8A98A6] leading-relaxed">
              Unified physics-informed workbench: RLC circuit resonance, spectral anomaly detection, 
              NASA C-MAPSS Remaining Useful Life (RUL) regression, and parametric Weibull reliability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("WORKBENCH")}
              className="px-4 py-2.5 bg-[#48E6D2] hover:bg-[#3cd3bf] text-[#070B11] font-semibold text-xs font-mono tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(72,230,210,0.25)] hover:shadow-[0_0_20px_rgba(72,230,210,0.4)]"
            >
              <Cpu className="w-4 h-4" />
              <span>CIRCUIT WORKBENCH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate("SIGNAL LAB")}
              className="px-4 py-2.5 bg-[#111A23] hover:bg-[#152330] border border-[#1D2B35] hover:border-[#48E6D2]/40 text-[#E6EDF3] font-mono text-xs tracking-wider flex items-center gap-2 transition-colors"
            >
              <Activity className="w-4 h-4 text-[#48E6D2]" />
              <span>SIGNAL LAB</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <section>
        <div className="text-[11px] font-mono tracking-wider text-[#8A98A6] uppercase mb-3 flex items-center gap-2">
          <span>KEY SYSTEM METRICS</span>
          <span className="h-px bg-[#1D2B35] flex-1"></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="ACTIVE CIRCUIT"
            value={circuitPreset || "Series RLC"}
            note="Topology & parameters active"
            status="cyan"
          />
          <MetricCard
            label="RESONANCE FREQUENCY"
            value={frequency.toFixed(1)}
            unit="Hz"
            note={`f₀ = 1/2π√LC (${dampingStatus})`}
            status="neutral"
          />
          <MetricCard
            label="SURVIVAL PROBABILITY"
            value={(survival * 100).toFixed(1)}
            unit="%"
            note="Weibull parametric scenario"
            status={survival > 0.8 ? "healthy" : survival > 0.5 ? "warning" : "critical"}
          />
          <MetricCard
            label="AI RUL MODEL"
            value={modelData?.mae_cycles ? `${modelData.mae_cycles.toFixed(1)}c` : "NASA FD001"}
            note={modelData?.mae_cycles ? `RMSE: ${modelData.rmse_cycles.toFixed(1)} cycles` : "Ridge regression ready"}
            status="cyan"
          />
        </div>
      </section>

      {/* Subsystem Health & Live Context Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Health & Anomaly Preview */}
        <div className="lg:col-span-2 bg-[#0D141C] border border-[#1D2B35] p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#1D2B35] pb-3">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#48E6D2]" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
                TELEMETRY & AI HEALTH REPORT
              </h2>
            </div>
            <StatusBadge 
              status={signalHealth?.status || "healthy"} 
              label={signalHealth?.status?.toUpperCase() || "HEALTHY"} 
              size="sm" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
                  CURRENT DIAGNOSIS
                </span>
                <div className="text-sm font-semibold text-[#E6EDF3] leading-snug">
                  {signalHealth?.label || "Normal operation / no strong rule-based concern"}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1D2B35] flex items-center justify-between text-xs font-mono text-[#8A98A6]">
                <span>Confidence Level</span>
                <span className="text-[#48E6D2] font-semibold">
                  {((signalHealth?.confidence || 0.56) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="bg-[#111A23] border border-[#1D2B35] p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider block mb-1">
                  SOURCE SIGNAL EVIDENCE
                </span>
                <div className="text-xs text-[#8A98A6] space-y-1">
                  <div>• Source: <span className="text-[#E6EDF3] font-mono">{signalHealth?.source || "Synthetic sine @ 82 Hz"}</span></div>
                  <div>• RMS Energy: <span className="text-[#E6EDF3] font-mono">{signalHealth?.rms ? signalHealth.rms.toFixed(3) : "0.707"}</span></div>
                  <div>• Crest Factor: <span className="text-[#E6EDF3] font-mono">{signalHealth?.crest ? signalHealth.crest.toFixed(2) : "1.41"}</span></div>
                </div>
              </div>
              <button
                onClick={() => onNavigate("SIGNAL LAB")}
                className="mt-4 text-[11px] font-mono text-[#48E6D2] hover:underline flex items-center gap-1"
              >
                Inspect waveform spectrum →
              </button>
            </div>
          </div>

          <div className="bg-[#111A23]/50 border border-[#1D2B35] p-3 text-[11px] font-mono text-[#8A98A6] flex items-center justify-between">
            <span>DIGITAL TWIN RESIDUAL LINK: Active RLC resonance at {frequency.toFixed(2)} Hz</span>
            <span className="text-[#48E6D2]">SYNCHRONIZED</span>
          </div>
        </div>

        {/* Digital Twin Connected Modules */}
        <div className="bg-[#0D141C] border border-[#1D2B35] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1D2B35] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#48E6D2]" />
                <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
                  DIGITAL TWIN PIPELINE
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#48E6D2]">ACTIVE LINK</span>
            </div>

            <div className="space-y-2.5">
              <div 
                onClick={() => onNavigate("WORKBENCH")}
                className="p-3 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-3.5 h-3.5 text-[#48E6D2]" />
                  <span className="font-sans text-[#E6EDF3]">1. Circuit Simulator</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A98A6]">RLC Physics</span>
              </div>

              <div 
                onClick={() => onNavigate("SIGNAL LAB")}
                className="p-3 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-3.5 h-3.5 text-[#48E6D2]" />
                  <span className="font-sans text-[#E6EDF3]">2. Signal DSP Lab</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A98A6]">FFT Features</span>
              </div>

              <div 
                onClick={() => onNavigate("AI MODELS")}
                className="p-3 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#48E6D2]" />
                  <span className="font-sans text-[#E6EDF3]">3. AI Models</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A98A6]">NASA RUL</span>
              </div>

              <div 
                onClick={() => onNavigate("RELIABILITY")}
                className="p-3 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#48E6D2]" />
                  <span className="font-sans text-[#E6EDF3]">4. Reliability Lab</span>
                </div>
                <span className="text-[10px] font-mono text-[#8A98A6]">Weibull Risk</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("DIGITAL TWIN")}
            className="w-full mt-4 py-2 bg-[#111A23] hover:bg-[#152330] border border-[#1D2B35] hover:border-[#48E6D2]/50 text-[11px] font-mono text-[#48E6D2] text-center transition-colors"
          >
            VIEW INTEGRATED TWIN GRAPH →
          </button>
        </div>
      </div>

      {/* Recent Telemetry & Analysis History Table */}
      <section className="bg-[#0D141C] border border-[#1D2B35] p-5">
        <div className="flex items-center justify-between border-b border-[#1D2B35] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#48E6D2]" />
            <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
              RECENT ANALYSES & TELEMETRY LOGS
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#8A98A6]">
            {history.length} RECORD{history.length === 1 ? "" : "S"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#1D2B35] text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider bg-[#111A23]/50">
                <th className="py-2.5 px-3">RECORD ID</th>
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">MODULE</th>
                <th className="py-2.5 px-3">RESULT / FINDING</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B35]/40 font-mono text-[11px]">
              {history.map((rec, i) => (
                <tr key={i} className="hover:bg-[#111A23]/40 transition-colors">
                  <td className="py-2.5 px-3 text-[#48E6D2]">{rec.id}</td>
                  <td className="py-2.5 px-3 text-[#8A98A6]">{rec.formattedDate || rec.timestamp}</td>
                  <td className="py-2.5 px-3 text-[#E6EDF3] font-sans">{rec.module || rec.system}</td>
                  <td className="py-2.5 px-3 text-[#8A98A6] max-w-xs truncate">{rec.result || rec.summary}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={rec.status || "healthy"} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
