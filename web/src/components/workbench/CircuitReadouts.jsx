import React from "react";
import { MetricCard } from "../common/MetricCard";

export function CircuitReadouts({ frequency, damping, partsCount, wiresCount }) {
  const dampingLabel = damping < 1 ? "UNDERDAMPED" : damping === 1 ? "CRITICALLY DAMPED" : "OVERDAMPED";
  const dampingStatus = damping < 1 ? "cyan" : "neutral";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
      <MetricCard
        label="NATURAL RESONANCE (f₀)"
        value={frequency.toFixed(2)}
        unit="Hz"
        note="Formula: 1 / (2π√LC)"
        status="cyan"
      />
      <MetricCard
        label="DAMPING RATIO (ζ)"
        value={damping.toFixed(4)}
        note={dampingLabel}
        status={dampingStatus}
      />
      <MetricCard
        label="GRAPH TOPOLOGY"
        value={wiresCount > 0 ? "CONNECTED" : "DRAFT"}
        note={`${partsCount} nodes • ${wiresCount} wire edges`}
        status={wiresCount > 0 ? "healthy" : "warning"}
      />
    </div>
  );
}
