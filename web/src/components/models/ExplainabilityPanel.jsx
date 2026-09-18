import React from "react";
import { Info, HelpCircle, Activity, Sparkles } from "lucide-react";

export function ExplainabilityPanel() {
  const sensorFeatures = [
    { name: "Sensor 2 (LPC Outlet Temp)", importance: "32%", trend: "Degradation upward drift", weight: "+0.48" },
    { name: "Sensor 4 (LPT Outlet Temp)", importance: "24%", trend: "Degradation upward drift", weight: "+0.39" },
    { name: "Sensor 7 (HPC Pressure Ratio)", importance: "18%", trend: "Downward slope near failure", weight: "-0.28" },
    { name: "Sensor 11 (Static Pressure)", importance: "14%", trend: "High variance in final 30 cycles", weight: "+0.21" },
    { name: "Sensor 15 (Bypass Ratio)", importance: "12%", trend: "Accelerated drift", weight: "-0.19" }
  ];

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#48E6D2]" />
          <h2 className="text-xs sm:text-sm font-semibold text-[#E6EDF3] uppercase tracking-wide font-sans">
            AI EXPLAINABILITY & SENSOR DRIFT IMPORTANCE
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8A98A6]">
          INSPECTABLE RIDGE WEIGHTS
        </span>
      </div>

      <p className="text-xs text-[#8A98A6] leading-relaxed">
        Because Sentinel AI uses transparent Ridge regression rather than an opaque deep neural network,
        coefficients directly correspond to physical thermodynamic degradation indicators across the 21 C-MAPSS telemetry channels.
      </p>

      <div className="space-y-2.5">
        {sensorFeatures.map((s, idx) => (
          <div
            key={idx}
            className="bg-[#111A23] border border-[#1D2B35] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-[#48E6D2]"></span>
              <span className="text-[#E6EDF3] font-sans font-medium">{s.name}</span>
            </div>

            <div className="flex items-center gap-4 text-[#8A98A6]">
              <span className="text-[11px]">{s.trend}</span>
              <span className="text-[#48E6D2] font-semibold">{s.importance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
