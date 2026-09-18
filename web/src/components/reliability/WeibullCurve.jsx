import React, { useState, useRef } from "react";
import { generateWeibullCurve } from "../../utils/reliability";
import { ShieldCheck, Crosshair } from "lucide-react";

export function WeibullCurve({ eta, beta, currentAge }) {
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  const curvePoints = generateWeibullCurve(eta, beta, eta * 2.2, 100);
  const maxT = eta * 2.2;
  const width = 800;
  const height = 240;
  const paddingBottom = 24;

  // Survival Curve Path
  const survivalPath = curvePoints
    .map((p, i) => {
      const x = (p.t / maxT) * width;
      const y = height - paddingBottom - p.r * (height - paddingBottom - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Failure Probability Curve Path
  const failurePath = curvePoints
    .map((p, i) => {
      const x = (p.t / maxT) * width;
      const y = height - paddingBottom - p.f * (height - paddingBottom - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Current Age marker coordinates
  const currentAgeX = Math.min(width, Math.max(0, (currentAge / maxT) * width));

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetT = relX * maxT;
    const r = Math.exp(-Math.pow(targetT / eta, beta));
    const f = 1 - r;
    setHoverData({ t: targetT.toFixed(0), r: (r * 100).toFixed(1), f: (f * 100).toFixed(1), xPercent: relX * 100 });
  };

  const handleMouseLeave = () => setHoverData(null);

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span className="text-xs font-mono font-semibold text-[#E6EDF3] uppercase tracking-wide">
            WEIBULL SURVIVAL R(t) & CUMULATIVE FAILURE F(t) CURVES
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-[#48E6D2]">
            <span className="w-2 h-2 bg-[#48E6D2]"></span> SURVIVAL R(t)
          </span>
          <span className="flex items-center gap-1.5 text-[#EF4444]">
            <span className="w-2 h-2 bg-[#EF4444]"></span> FAILURE F(t)
          </span>
          <span className="flex items-center gap-1.5 text-[#F59E0B]">
            <span className="w-2 h-2 bg-[#F59E0B]"></span> CURRENT AGE ({currentAge}h)
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-60 bg-[#070B11] border border-[#1D2B35] overflow-hidden cursor-crosshair select-none"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="survGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#48E6D2" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#48E6D2" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height - paddingBottom} x2={width} y2={height - paddingBottom} stroke="#2E4252" strokeWidth="1" />

          {/* Survival filled area */}
          <polygon
            points={`0,${height - paddingBottom} ${survivalPath} ${width},${height - paddingBottom}`}
            fill="url(#survGrad)"
          />

          {/* Survival R(t) curve */}
          <polyline
            fill="none"
            stroke="#48E6D2"
            strokeWidth="2"
            points={survivalPath}
            strokeLinejoin="round"
          />

          {/* Failure F(t) curve */}
          <polyline
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.6"
            strokeDasharray="4 2"
            points={failurePath}
            strokeLinejoin="round"
          />

          {/* Current Age Marker Line */}
          <line
            x1={currentAgeX}
            y1="0"
            x2={currentAgeX}
            y2={height - paddingBottom}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Hover Crosshair Overlay */}
        {hoverData && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
            style={{ left: `${hoverData.xPercent}%` }}
          >
            <div className="w-px h-full bg-[#48E6D2]/70"></div>
            <div className="absolute top-2 bg-[#111A23]/90 border border-[#48E6D2] px-2 py-1 text-[10px] font-mono text-[#E6EDF3] shadow-lg whitespace-nowrap -translate-x-1/2">
              t = {hoverData.t}h | R(t) = {hoverData.r}% | F(t) = {hoverData.f}%
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A98A6]">
        <span>0 hours</span>
        <span>{(maxT * 0.5).toFixed(0)} hours</span>
        <span>{(maxT).toFixed(0)} hours (2.2 × η)</span>
      </div>
    </div>
  );
}
