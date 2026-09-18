import React from "react";
import { WeibullCurve } from "./WeibullCurve";
import { ConditionAdjustment } from "./ConditionAdjustment";
import { MetricCard } from "../common/MetricCard";
import { SectionHeader } from "../common/SectionHeader";
import { StatusBadge } from "../common/StatusBadge";
import { calculateWeibull } from "../../utils/reliability";
import { Sliders, ShieldCheck, Cpu, ArrowRight } from "lucide-react";

export function ReliabilityLab({
  age,
  setAge,
  eta,
  setEta,
  beta,
  setBeta,
  survival,
  frequency,
  onNavigate
}) {
  let signalHealth = null;
  try {
    signalHealth = JSON.parse(localStorage.getItem("sentinelSignalHealth"));
  } catch (e) {}

  const isAnomaly = signalHealth?.label?.includes("anomaly") || signalHealth?.crest > 3.5;
  const conditionFactor = isAnomaly ? 0.85 : 1.0;
  const adjustedSurvival = Math.max(0, Math.min(1, survival * conditionFactor));
  const adjustedFailure = 1 - adjustedSurvival;

  const weibullMetrics = calculateWeibull(age, eta, beta);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <SectionHeader
        eyebrow="PARAMETRIC WEIBULL LIFETIME ANALYSIS"
        title="Reliability & Failure Probability Lab"
        description="Model time-to-failure probabilities using parametric Weibull statistics (R(t) = exp(-(t/η)^β)) combined with real-time telemetry condition adjustments."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("WORKBENCH")}
              className="px-3 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/40 text-[#E6EDF3] text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-[#48E6D2]" />
              <span>OPEN WORKBENCH</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="CONDITION-ADJUSTED SURVIVAL"
          value={(adjustedSurvival * 100).toFixed(1)}
          unit="%"
          note={`Base model: ${(survival * 100).toFixed(1)}% at ${age}h`}
          status={adjustedSurvival > 0.8 ? "healthy" : adjustedSurvival > 0.5 ? "warning" : "critical"}
        />
        <MetricCard
          label="FAILURE PROBABILITY F(t)"
          value={(adjustedFailure * 100).toFixed(1)}
          unit="%"
          note="1.0 - Condition-Adjusted R(t)"
          status={adjustedFailure > 0.25 ? "critical" : adjustedFailure > 0.1 ? "warning" : "healthy"}
        />
        <MetricCard
          label="EXPECTED LIFETIME (MTTF)"
          value={weibullMetrics.expectedLife.toFixed(0)}
          unit="hours"
          note="Mean Time To Failure (η · Γ(1+1/β))"
          status="neutral"
        />
        <MetricCard
          label="INSTANTANEOUS HAZARD h(t)"
          value={weibullMetrics.hazard.toExponential(3)}
          unit="/ hr"
          note={`Shape β = ${beta} (${beta > 1 ? "Wear-out regime" : "Infant mortality"})`}
          status="cyan"
        />
      </div>

      {/* Main Grid: Parameter Controls & Survival Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Weibull Parameter Controls */}
        <div className="bg-[#0D141C] border border-[#1D2B35] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#48E6D2]" />
                <h2 className="text-xs font-mono font-semibold text-[#E6EDF3] uppercase tracking-wide">
                  SCENARIO PARAMETERS
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#8A98A6]">WEIBULL FIT</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[#8A98A6] mb-1">
                  <span>CURRENT AGE (t)</span>
                  <span className="text-[#E6EDF3] font-semibold">{age} hours</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="50"
                  value={age}
                  onChange={e => setAge(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2.5 py-1.5 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#8A98A6] mb-1">
                  <span>SCALE PARAMETER (η)</span>
                  <span className="text-[#E6EDF3] font-semibold">{eta} hours</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="500000"
                  step="100"
                  value={eta}
                  onChange={e => setEta(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2.5 py-1.5 outline-none"
                />
                <span className="text-[9px] text-[#8A98A6] block mt-0.5">
                  Characteristic life (time at 63.2% cumulative failure).
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[#8A98A6] mb-1">
                  <span>SHAPE PARAMETER (β)</span>
                  <span className="text-[#E6EDF3] font-semibold">{beta}</span>
                </div>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={beta}
                  onChange={e => setBeta(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2.5 py-1.5 outline-none"
                />
                <span className="text-[9px] text-[#8A98A6] block mt-0.5">
                  β &lt; 1: Early failure • β = 1: Exponential • β &gt; 1: Wearout.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1D2B35] text-[10px] font-mono text-[#8A98A6] leading-relaxed">
            Note: Weibull distributions represent parametric stochastic hypotheses, not definitive failure guarantees.
          </div>
        </div>

        {/* Right: Weibull Curve Visualizer */}
        <div className="lg:col-span-2">
          <WeibullCurve
            eta={eta}
            beta={beta}
            currentAge={age}
          />
        </div>
      </div>

      {/* Real-time Telemetry & Signal Coupling Section */}
      <ConditionAdjustment
        signalHealth={signalHealth}
        frequency={frequency}
        onNavigate={onNavigate}
      />
    </div>
  );
}
