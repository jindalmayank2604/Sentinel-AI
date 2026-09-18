import React from "react";
import { BarChart3, TrendingDown } from "lucide-react";

export function RulChart({ samplePredictions }) {
  if (!samplePredictions || samplePredictions.length === 0) return null;

  const maxVal = 135;
  const height = 180;
  const width = 600;

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span className="text-xs font-mono font-semibold text-[#E6EDF3] uppercase tracking-wide">
            SAMPLE HELD-OUT PREDICTIONS (ACTUAL VS PREDICTED RUL)
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-[#48E6D2]">
            <span className="w-2.5 h-2.5 bg-[#48E6D2]"></span> PREDICTED
          </span>
          <span className="flex items-center gap-1.5 text-[#8A98A6]">
            <span className="w-2.5 h-2.5 bg-[#2E4252]"></span> GROUND TRUTH
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {samplePredictions.map(([unit, pred, actual], i) => {
          const predHeight = Math.max(8, (pred / maxVal) * 100);
          const actualHeight = Math.max(8, (actual / maxVal) * 100);
          const error = Math.abs(pred - actual);

          return (
            <div
              key={unit}
              className="bg-[#111A23] border border-[#1D2B35] p-3 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8A98A6]">
                <span>ENGINE #{unit}</span>
                <span className="text-[#E6EDF3]">Δ {error.toFixed(1)}c</span>
              </div>

              {/* Bar Comparison Graphic */}
              <div className="h-28 flex items-end justify-center gap-3 bg-[#070B11] p-2 border border-[#1D2B35]/50 relative">
                {/* Actual Bar */}
                <div className="w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${actualHeight}%` }}
                    className="w-full bg-[#2E4252] border border-[#3E5568]"
                    title={`Ground Truth: ${actual.toFixed(1)} cycles`}
                  ></div>
                  <span className="text-[9px] font-mono text-[#8A98A6] mt-1">
                    {actual.toFixed(0)}
                  </span>
                </div>

                {/* Predicted Bar */}
                <div className="w-5 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${predHeight}%` }}
                    className="w-full bg-[#48E6D2] shadow-[0_0_8px_rgba(72,230,210,0.3)]"
                    title={`Predicted RUL: ${pred.toFixed(1)} cycles`}
                  ></div>
                  <span className="text-[9px] font-mono text-[#48E6D2] font-semibold mt-1">
                    {pred.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-center text-[#8A98A6] border-t border-[#1D2B35]/40 pt-1">
                RUL: <span className="text-[#48E6D2]">{pred.toFixed(1)} cycles</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
