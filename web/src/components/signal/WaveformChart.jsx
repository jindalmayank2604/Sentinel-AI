import React, { useState, useRef } from "react";
import { Activity, Maximize2, RefreshCw } from "lucide-react";

export function WaveformChart({ samples, source, sampleRateHz }) {
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  if (!samples || samples.length === 0) {
    return (
      <div className="w-full h-64 bg-[#0D141C] border border-[#1D2B35] flex items-center justify-center text-xs font-mono text-[#8A98A6]">
        No signal data available to render.
      </div>
    );
  }

  // Display subset for clean performance
  const displayCount = Math.min(samples.length, 1000);
  const displaySamples = samples.slice(0, displayCount);
  const maxVal = Math.max(...displaySamples.map(Math.abs), 0.001);
  const width = 800;
  const height = 240;
  const paddingY = 20;

  const points = displaySamples
    .map((v, i) => {
      const x = (i / Math.max(displayCount - 1, 1)) * width;
      const y = height / 2 - (v / maxVal) * (height / 2 - paddingY);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sampleIdx = Math.floor(relX * (displayCount - 1));
    const val = displaySamples[sampleIdx];
    const timeMs = ((sampleIdx / sampleRateHz) * 1000).toFixed(2);
    setHoverData({ idx: sampleIdx, val: val.toFixed(4), timeMs, xPercent: relX * 100 });
  };

  const handleMouseLeave = () => setHoverData(null);

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-4 flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span className="text-xs font-mono font-semibold text-[#E6EDF3] uppercase tracking-wide">
            TIME DOMAIN OSCILLOSCOPE
          </span>
          <span className="text-[10px] font-mono text-[#8A98A6]">
            ({source.toUpperCase()})
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8A98A6]">
          <span>PEAK: ±{maxVal.toFixed(3)}</span>
          <span className="text-[#48E6D2]">{displayCount} SAMPLES</span>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-56 bg-[#070B11] border border-[#1D2B35] overflow-hidden cursor-crosshair select-none"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#48E6D2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#48E6D2" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#2E4252" strokeWidth="1" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />

          <line x1={width * 0.25} y1="0" x2={width * 0.25} y2={height} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={width * 0.5} y1="0" x2={width * 0.5} y2={height} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={width * 0.75} y1="0" x2={width * 0.75} y2={height} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />

          {/* Primary Waveform Polyline */}
          <polyline
            fill="none"
            stroke="#48E6D2"
            strokeWidth="1.8"
            points={points}
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(72,230,210,0.5))" }}
          />
        </svg>

        {/* Hover Inspector Crosshair */}
        {hoverData && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
            style={{ left: `${hoverData.xPercent}%` }}
          >
            <div className="w-px h-full bg-[#48E6D2]/80"></div>
            <div className="absolute top-2 bg-[#111A23]/90 border border-[#48E6D2] px-2 py-1 text-[10px] font-mono text-[#E6EDF3] shadow-lg whitespace-nowrap -translate-x-1/2">
              t = {hoverData.timeMs} ms | amp = {hoverData.val}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A98A6]">
        <span>0.0 ms</span>
        <span>{((displayCount / sampleRateHz) * 500).toFixed(1)} ms</span>
        <span>{((displayCount / sampleRateHz) * 1000).toFixed(1)} ms</span>
      </div>
    </div>
  );
}
