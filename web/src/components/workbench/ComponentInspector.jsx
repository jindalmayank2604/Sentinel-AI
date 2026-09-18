import React from "react";
import { Sliders, Zap, Trash2, ArrowRight } from "lucide-react";

export function ComponentInspector({
  activeComponent,
  selected,
  onUpdateValue,
  onDeleteComponent,
  r,
  setR,
  l,
  setL,
  c,
  setC,
  onNavigate
}) {
  return (
    <aside className="w-full lg:w-72 bg-[#0D141C] border border-[#1D2B35] p-3.5 sm:p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#48E6D2] uppercase">
            COMPONENT INSPECTOR
          </span>
          {activeComponent && (
            <button
              onClick={onDeleteComponent}
              className="text-[#EF4444] hover:text-[#EF4444]/80 p-1 hover:bg-[#EF4444]/10 transition-colors"
              title="Delete selected component"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeComponent ? (
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-mono text-[#8A98A6] uppercase">NAME</div>
              <div className="text-base font-mono font-bold text-[#E6EDF3] mt-0.5">
                {activeComponent.name}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8A98A6] uppercase block mb-1">
                VALUE / SPECIFICATION
              </label>
              <input
                type="text"
                value={activeComponent.value || ""}
                onChange={e => onUpdateValue(selected, e.target.value)}
                className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] text-xs px-2.5 py-1.5 font-mono outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#111A23] p-2 border border-[#1D2B35]">
                <span className="text-[9px] text-[#8A98A6] block">TYPE</span>
                <span className="text-[#E6EDF3] truncate block mt-0.5">{activeComponent.type}</span>
              </div>
              <div className="bg-[#111A23] p-2 border border-[#1D2B35]">
                <span className="text-[9px] text-[#8A98A6] block">TAG</span>
                <span className="text-[#48E6D2] block mt-0.5">{activeComponent.tag}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-[#8A98A6] border border-dashed border-[#1D2B35] p-4">
            Click any component on the canvas to inspect and edit its parameters.
          </div>
        )}

        {/* Global Physics RLC Parameter Tuning */}
        <div className="pt-3 border-t border-[#1D2B35] space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-[#48E6D2] uppercase">
            <Sliders className="w-3.5 h-3.5" />
            <span>SERIES RLC PHYSICS MODEL</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[10px] text-[#8A98A6] mb-1">
                <span>RESISTANCE (R)</span>
                <span className="text-[#E6EDF3]">{r} Ω</span>
              </div>
              <input
                type="number"
                step="1"
                min="0.1"
                value={r}
                onChange={e => setR(Math.max(0.01, Number(e.target.value)))}
                className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2 py-1 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#8A98A6] mb-1">
                <span>INDUCTANCE (L)</span>
                <span className="text-[#E6EDF3]">{l} H</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.001"
                value={l}
                onChange={e => setL(Math.max(0.0001, Number(e.target.value)))}
                className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2 py-1 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-[#8A98A6] mb-1">
                <span>CAPACITANCE (C)</span>
                <span className="text-[#E6EDF3]">{c} F</span>
              </div>
              <input
                type="number"
                step="0.00001"
                min="0.000001"
                value={c}
                onChange={e => setC(Math.max(0.0000001, Number(e.target.value)))}
                className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] px-2 py-1 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-[#1D2B35] space-y-2">
        <button
          onClick={() => onNavigate("SIGNAL LAB")}
          className="w-full py-2 bg-[#48E6D2] hover:bg-[#3cd3bf] text-[#070B11] font-mono text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>SIMULATE IN SIGNAL LAB</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigate("RELIABILITY")}
          className="w-full py-2 bg-[#111A23] hover:bg-[#152330] border border-[#1D2B35] hover:border-[#48E6D2]/40 text-[#E6EDF3] font-mono text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>OPEN RELIABILITY SCENARIO</span>
        </button>
      </div>
    </aside>
  );
}
