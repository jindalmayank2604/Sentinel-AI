import React, { useState } from "react";
import { Zap, Link2, Trash2 } from "lucide-react";

export function Canvas2D({
  parts,
  wires,
  selected,
  wireMode,
  wireStart,
  onPick,
  onDrop,
  onDeleteSelected
}) {
  const [zoom, setZoom] = useState(1);

  const handleWheel = e => {
    e.preventDefault();
    e.stopPropagation();
    // Keep a very small safety floor, while allowing practical zoom-in and
    // zoom-out without an upper limit.
    setZoom(current => Math.max(0.025, current * Math.exp(-e.deltaY * 0.0045)));
  };

  return (
    <div
      className={`relative w-full h-[420px] sm:h-[480px] lg:h-[540px] bg-[#0A1017] border border-[#1D2B35] overflow-hidden select-none ${
        wireMode ? "cursor-crosshair" : "cursor-default"
      }`}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(29, 43, 53, 0.4) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(29, 43, 53, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px"
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      onWheel={handleWheel}
    >
      <div className="absolute top-3 left-3 z-30 flex border border-[#1D2B35] bg-[#0D141C]/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setZoom(current => current * 1.25)}
          className="px-3 py-1.5 text-sm font-mono text-[#E6EDF3] hover:bg-[#16313a] hover:text-[#48E6D2] border-r border-[#1D2B35]"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom(current => Math.max(0.025, current * 0.8))}
          className="px-3 py-1.5 text-sm font-mono text-[#E6EDF3] hover:bg-[#16313a] hover:text-[#48E6D2]"
          title="Zoom out"
        >
          −
        </button>
      </div>
      <div
        className="absolute inset-0 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
      {/* Schematic SVG Wire Paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48E6D2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {wires.map((w, i) => {
          const a = parts[w.from];
          const b = parts[w.to];
          if (!a || !b) return null;

          // Manhattan-style or direct spline wiring
          const midX = (a.x + b.x) / 2;
          const pathData = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;

          return (
            <g key={i}>
              {/* Outer soft glow */}
              <path
                d={pathData}
                stroke="#48E6D2"
                strokeWidth="0.8"
                strokeOpacity="0.25"
                fill="none"
              />
              {/* Core dashed line with animated flow */}
              <path
                d={pathData}
                stroke="url(#wireGrad)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
                fill="none"
                filter="url(#glow)"
              />
              {/* Wire Node Junction Dots */}
              <circle cx={a.x} cy={a.y} r="0.6" fill="#48E6D2" />
              <circle cx={b.x} cy={b.y} r="0.6" fill="#48E6D2" />
            </g>
          );
        })}
      </svg>

      {/* Component Nodes */}
      {parts.map((part, i) => {
        const isSelected = selected === i;
        const isWireFrom = wireStart === i;

        return (
          <div
            key={part.name + i}
            draggable={!wireMode}
            onDragStart={e => e.dataTransfer.setData("sentinel", "move:" + i)}
            onClick={() => onPick(i)}
            style={{
              left: `${part.x}%`,
              top: `${part.y}%`,
              transform: "translate(-50%, -50%)"
            }}
            className={`absolute z-10 w-28 sm:w-32 bg-[#0D141C] border transition-all duration-150 p-2 text-left shadow-lg select-none ${
              isWireFrom
                ? "border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-[#F59E0B]"
                : isSelected
                ? "border-[#48E6D2] shadow-[0_0_15px_rgba(72,230,210,0.3)] ring-1 ring-[#48E6D2]"
                : "border-[#1D2B35] hover:border-[#2E4252] hover:shadow-black/50"
            }`}
          >
            {/* Terminal Connection Pins */}
            <span
              className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-none border border-[#070B11] ${
                isSelected ? "bg-[#48E6D2]" : "bg-[#8A98A6]"
              }`}
            />
            <span
              className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-none border border-[#070B11] ${
                isSelected ? "bg-[#48E6D2]" : "bg-[#8A98A6]"
              }`}
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#48E6D2]">
                {part.tag}
              </span>
              <span className="text-[9px] font-mono text-[#8A98A6] uppercase">
                {part.type}
              </span>
            </div>

            <div className="text-xs font-sans font-semibold text-[#E6EDF3] truncate my-0.5">
              {part.name}
            </div>

            <div className="text-[10px] font-mono text-[#8A98A6] truncate bg-[#111A23] px-1 py-0.5 border border-[#1D2B35]/50">
              {part.value}
            </div>
          </div>
        );
      })}
      </div>

      {/* Canvas Status & Mode Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#0D141C]/90 backdrop-blur-sm border border-[#1D2B35] px-3 py-1.5 text-[10px] font-mono text-[#8A98A6] flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#48E6D2]"></span>
          {wireMode
            ? wireStart === null
              ? "WIRING MODE: CLICK 1ST COMPONENT"
              : "WIRING MODE: CLICK 2ND COMPONENT TO COMPLETE WIRE"
            : "DRAG PALETTE TO PLACE • DRAG PART TO MOVE • CLICK TO INSPECT"}
        </span>
        <span>• WHEEL ZOOM {zoom.toFixed(2)}×</span>
      </div>
    </div>
  );
}
