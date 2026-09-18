import React, { useState, useRef } from "react";
import { Radio, BarChart2 } from "lucide-react";

export function SpectrumChart({ fftData, sampleRateHz }) {
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  if (!fftData || !fftData.frequencies || fftData.frequencies.length === 0) {
    return (
      <div className="w-full h-64 bg-[#0D141C] border border-[#1D2B35] flex items-center justify-center text-xs font-mono text-[#8A98A6]">
        Computing single-sided FFT amplitude spectrum...
      </div>
    );
  }

  const { frequencies, amplitudes, peakFreq, peakAmp, resolutionHz } = fftData;
  const nyquistHz = sampleRateHz / 2;
  const maxAmp = Math.max(...amplitudes, 0.001);

  const width = 800;
  const height = 240;
  const paddingBottom = 20;

  const points = frequencies
    .map((f, i) => {
      const x = (f / nyquistHz) * width;
      const y = height - paddingBottom - (amplitudes[i] / maxAmp) * (height - paddingBottom - 20);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetFreq = relX * nyquistHz;
    const binIdx = Math.min(
      frequencies.length - 1,
      Math.max(0, Math.floor(targetFreq / resolutionHz))
    );
    const f = frequencies[binIdx];
    const a = amplitudes[binIdx];
    setHoverData({ freq: f?.toFixed(1), amp: a?.toFixed(4), xPercent: relX * 100 });
  };

  const handleMouseLeave = () => setHoverData(null);

  return (
    <div className="bg-[#0D141C] border border-[#1D2B35] p-4 flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-xs font-mono font-semibold text-[#E6EDF3] uppercase tracking-wide">
            FREQUENCY DOMAIN FFT SPECTRUM (HANN)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8A98A6]">
          <span>DOMINANT: <span className="text-[#38BDF8]">{peakFreq.toFixed(1)} Hz</span></span>
          <span>RES: {resolutionHz.toFixed(2)} Hz</span>
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
            <linearGradient id="fftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#1D2B35" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1={height - paddingBottom} x2={width} y2={height - paddingBottom} stroke="#2E4252" strokeWidth="1" />

          {/* Filled Area below spectrum */}
          <polygon
            points={`0,${height - paddingBottom} ${points} ${width},${height - paddingBottom}`}
            fill="url(#fftGrad)"
          />

          {/* FFT Spectrum Line */}
          <polyline
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.8"
            points={points}
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.5))" }}
          />
        </svg>

        {/* Hover Crosshair */}
        {hoverData && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
            style={{ left: `${hoverData.xPercent}%` }}
          >
            <div className="w-px h-full bg-[#38BDF8]/80"></div>
            <div className="absolute top-2 bg-[#111A23]/90 border border-[#38BDF8] px-2 py-1 text-[10px] font-mono text-[#E6EDF3] shadow-lg whitespace-nowrap -translate-x-1/2">
              f = {hoverData.freq} Hz | amp = {hoverData.amp}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A98A6]">
        <span>0 Hz</span>
        <span>{(nyquistHz * 0.5).toFixed(0)} Hz</span>
        <span>{nyquistHz.toFixed(0)} Hz (Nyquist)</span>
      </div>
    </div>
  );
}
