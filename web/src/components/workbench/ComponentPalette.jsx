import React from "react";
import { Search, Plus, Sparkles } from "lucide-react";

export function ComponentPalette({
  catalog,
  presets,
  query,
  setQuery,
  category,
  setCategory,
  onAdd,
  onReset
}) {
  const categories = ["All", ...new Set(catalog.map(x => x[2]))];
  const filtered = catalog.filter(
    x =>
      (category === "All" || x[2] === category) &&
      x.join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-64 bg-[#0D141C] border border-[#1D2B35] p-3.5 sm:p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#1D2B35] pb-2">
          <span className="text-[10px] font-mono tracking-widest text-[#48E6D2] uppercase">
            COMPONENT LIBRARY
          </span>
          <span className="text-[10px] font-mono text-[#8A98A6]">
            {filtered.length} ITEMS
          </span>
        </div>

        {/* Search and Category Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A98A6] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search components..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#111A23] border border-[#1D2B35] focus:border-[#48E6D2] text-[#E6EDF3] text-xs pl-8 pr-2.5 py-1.5 font-sans placeholder-[#8A98A6] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 text-[10px] font-mono whitespace-nowrap border transition-colors ${
                  category === cat
                    ? "bg-[#48E6D2]/10 border-[#48E6D2] text-[#48E6D2]"
                    : "bg-[#111A23] border-[#1D2B35] text-[#8A98A6] hover:text-[#E6EDF3]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Component List */}
        <div className="space-y-1.5 max-h-56 lg:max-h-[340px] overflow-y-auto pr-1">
          {filtered.map(([type, tag, group, defaultValue]) => (
            <div
              key={type}
              draggable
              onDragStart={e => e.dataTransfer.setData("sentinel", type)}
              className="group bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/60 p-2 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all hover:translate-x-0.5 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 bg-[#070B11] border border-[#1D2B35] text-[#48E6D2] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                  {tag}
                </span>
                <div className="truncate">
                  <div className="text-xs font-sans font-medium text-[#E6EDF3] truncate">
                    {type}
                  </div>
                  <div className="text-[10px] font-mono text-[#8A98A6] truncate">
                    {group} • {defaultValue}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAdd(type)}
                className="p-1 text-[#8A98A6] hover:text-[#48E6D2] hover:bg-[#070B11] border border-transparent hover:border-[#1D2B35] transition-colors"
                title={`Add ${type} to canvas`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Circuit Presets */}
      <div className="mt-4 pt-3 border-t border-[#1D2B35] space-y-2">
        <div className="text-[10px] font-mono tracking-widest text-[#8A98A6] uppercase flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#48E6D2]" />
          <span>BENCHMARK PRESETS</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {Object.keys(presets).map(presetName => (
            <button
              key={presetName}
              onClick={() => onReset(presetName)}
              className="w-full px-2.5 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 text-left text-xs font-mono text-[#8A98A6] hover:text-[#E6EDF3] flex items-center justify-between transition-colors"
            >
              <span>{presetName}</span>
              <span className="text-[9px] text-[#48E6D2] uppercase">LOAD</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
