import React, { useState } from "react";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas2D } from "./Canvas2D";
import { Canvas3D } from "./Canvas3D";
import { ComponentInspector } from "./ComponentInspector";
import { CircuitReadouts } from "./CircuitReadouts";
import { SectionHeader } from "../common/SectionHeader";
import { 
  Link2, 
  Trash2, 
  Box, 
  Layers, 
  RotateCcw, 
  Maximize2,
  Cpu,
  Info
} from "lucide-react";

export function CircuitWorkbench({
  catalog,
  presets,
  parts,
  setParts,
  wires,
  setWires,
  selected,
  setSelected,
  query,
  setQuery,
  category,
  setCategory,
  onAdd,
  onReset,
  onDrop,
  r,
  setR,
  l,
  setL,
  c,
  setC,
  frequency,
  damping,
  onNavigate
}) {
  const [wireMode, setWireMode] = useState(false);
  const [wireStart, setWireStart] = useState(null);
  const [view3D, setView3D] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState("canvas"); // 'palette' | 'canvas' | 'inspector'

  const activeComponent = parts[selected] || null;

  const handlePickComponent = i => {
    setSelected(i);
    if (!wireMode) return;

    if (wireStart === null) {
      setWireStart(i);
    } else if (wireStart !== i) {
      // Create new wire edge
      setWires(old => [...old, { from: wireStart, to: i }]);
      setWireStart(null);
    }
  };

  const handleUpdateValue = (idx, val) => {
    setParts(prev => prev.map((p, i) => (i === idx ? { ...p, value: val } : p)));
  };

  const handleDeleteSelected = () => {
    if (selected === null || selected === undefined) return;
    setParts(prev => prev.filter((_, i) => i !== selected));
    setWires(prev =>
      prev
        .filter(w => w.from !== selected && w.to !== selected)
        .map(w => ({
          from: w.from > selected ? w.from - 1 : w.from,
          to: w.to > selected ? w.to - 1 : w.to
        }))
    );
    setSelected(null);
  };

  const handleClearAll = () => {
    setParts([]);
    setWires([]);
    setSelected(null);
    setWireStart(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Workbench Header */}
      <SectionHeader
        eyebrow="PHYSICS-BASED CIRCUIT SIMULATOR"
        title="Circuit Workbench & Schematic Designer"
        description="Design RLC topologies, wire active and passive components, and calculate resonant frequencies and damping ratios in real time."
        actions={
          <div className="flex items-center gap-2">
            {/* 2D / 3D Mode Toggle */}
            <button
              onClick={() => setView3D(!view3D)}
              className={`px-3 py-1.5 border text-xs font-mono flex items-center gap-1.5 transition-all ${
                view3D
                  ? "bg-[#48E6D2] text-[#070B11] border-[#48E6D2] font-semibold shadow-[0_0_12px_rgba(72,230,210,0.3)]"
                  : "bg-[#111A23] border-[#1D2B35] text-[#E6EDF3] hover:border-[#48E6D2]/50"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{view3D ? "3D MODE ACTIVE" : "SWITCH TO 3D"}</span>
            </button>

            {/* Wire Connection Toggle */}
            <button
              onClick={() => {
                setWireMode(v => !v);
                setWireStart(null);
              }}
              className={`px-3 py-1.5 border text-xs font-mono flex items-center gap-1.5 transition-all ${
                wireMode
                  ? "bg-[#F59E0B] text-[#070B11] border-[#F59E0B] font-semibold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                  : "bg-[#111A23] border-[#1D2B35] text-[#E6EDF3] hover:border-[#48E6D2]/50"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{wireMode ? (wireStart === null ? "WIRE: PICK 1ST" : "WIRE: PICK 2ND") : "CONNECT WIRE"}</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#EF4444] text-[#8A98A6] hover:text-[#EF4444] text-xs font-mono transition-colors"
              title="Clear all components and wires"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border border-[#1D2B35] bg-[#0D141C] p-1 gap-1">
        <button
          onClick={() => setActiveTabMobile("palette")}
          className={`flex-1 py-1.5 text-xs font-mono ${
            activeTabMobile === "palette"
              ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
              : "text-[#8A98A6]"
          }`}
        >
          LIBRARY
        </button>
        <button
          onClick={() => setActiveTabMobile("canvas")}
          className={`flex-1 py-1.5 text-xs font-mono ${
            activeTabMobile === "canvas"
              ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
              : "text-[#8A98A6]"
          }`}
        >
          CANVAS ({parts.length})
        </button>
        <button
          onClick={() => setActiveTabMobile("inspector")}
          className={`flex-1 py-1.5 text-xs font-mono ${
            activeTabMobile === "inspector"
              ? "bg-[#111A23] text-[#48E6D2] border border-[#1D2B35]"
              : "text-[#8A98A6]"
          }`}
        >
          INSPECTOR
        </button>
      </div>

      {/* Main 3-Column Layout (Desktop) / Tabbed (Mobile) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Component Library */}
        <div className={`lg:block ${activeTabMobile === "palette" ? "block" : "hidden"}`}>
          <ComponentPalette
            catalog={catalog}
            presets={presets}
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            onAdd={onAdd}
            onReset={onReset}
          />
        </div>

        {/* Center: Canvas (2D Schematic or 3D Three.js) */}
        <div className={`flex-1 min-w-0 flex flex-col justify-between ${activeTabMobile === "canvas" ? "block" : "hidden lg:block"}`}>
          <div className="bg-[#0D141C] border border-[#1D2B35] p-2 sm:p-3 mb-2 flex items-center justify-between text-xs font-mono text-[#8A98A6]">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#48E6D2]" />
              <span className="text-[#E6EDF3] font-semibold">SCHEMATIC CANVAS</span>
              <span>• {parts.length} COMPONENTS</span>
              <span>• {wires.length} WIRES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#48E6D2]">
                {view3D ? "3D RENDERING ACTIVE" : "2D VECTOR CAD"}
              </span>
            </div>
          </div>

          {view3D ? (
            <Canvas3D
              parts={parts}
              wires={wires}
              selected={selected}
              onPick={handlePickComponent}
            />
          ) : (
            <Canvas2D
              parts={parts}
              wires={wires}
              selected={selected}
              wireMode={wireMode}
              wireStart={wireStart}
              onPick={handlePickComponent}
              onDrop={onDrop}
              onDeleteSelected={handleDeleteSelected}
            />
          )}

          <CircuitReadouts
            frequency={frequency}
            damping={damping}
            partsCount={parts.length}
            wiresCount={wires.length}
          />
        </div>

        {/* Right: Component & RLC Inspector */}
        <div className={`lg:block ${activeTabMobile === "inspector" ? "block" : "hidden"}`}>
          <ComponentInspector
            activeComponent={activeComponent}
            selected={selected}
            onUpdateValue={handleUpdateValue}
            onDeleteComponent={handleDeleteSelected}
            r={r}
            setR={setR}
            l={l}
            setL={setL}
            c={c}
            setC={setC}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
