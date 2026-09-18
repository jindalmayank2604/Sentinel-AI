import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  GitFork, 
  FileSpreadsheet, 
  RotateCcw,
  Search,
  ArrowRight,
  X
} from "lucide-react";

export function CommandPalette({ isOpen, onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: "nav-overview", label: "Open System Overview", group: "Navigation", icon: LayoutDashboard, action: () => onNavigate("OVERVIEW") },
    { id: "nav-workbench", label: "Open Circuit Workbench", group: "Navigation", icon: Cpu, action: () => onNavigate("WORKBENCH") },
    { id: "nav-signal", label: "Open Signal Lab", group: "Navigation", icon: Activity, action: () => onNavigate("SIGNAL LAB") },
    { id: "nav-models", label: "Open AI Models & NASA RUL", group: "Navigation", icon: BrainCircuit, action: () => onNavigate("AI MODELS") },
    { id: "nav-reliability", label: "Open Reliability Analysis", group: "Navigation", icon: ShieldCheck, action: () => onNavigate("RELIABILITY") },
    { id: "nav-twin", label: "Open Digital Twin", group: "Navigation", icon: GitFork, action: () => onNavigate("DIGITAL TWIN") },
    { id: "act-export", label: "Export Technical Analysis Report", group: "Actions", icon: FileSpreadsheet, action: () => onAction("EXPORT_REPORT") },
    { id: "act-reset-rlc", label: "Load Series RLC Preset", group: "Circuit Presets", icon: RotateCcw, action: () => onAction("PRESET_RLC") },
    { id: "act-reset-rc", label: "Load RC Filter Preset", group: "Circuit Presets", icon: RotateCcw, action: () => onAction("PRESET_RC") },
    { id: "act-reset-motor", label: "Load Motor Drive Preset", group: "Circuit Presets", icon: RotateCcw, action: () => onAction("PRESET_MOTOR") }
  ];

  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#0D141C] border border-[#2E4252] shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1D2B35] bg-[#111A23]/50">
          <Search className="w-4 h-4 text-[#48E6D2] shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to module..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-sans text-[#E6EDF3] placeholder-[#8A98A6] focus:outline-none"
          />
          <span className="text-[10px] font-mono text-[#8A98A6] bg-[#111A23] border border-[#1D2B35] px-1.5 py-0.5">
            ESC
          </span>
          <button onClick={onClose} className="text-[#8A98A6] hover:text-[#E6EDF3]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[#1D2B35]/30 p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#8A98A6]">
              No matching commands or navigation routes.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-sans transition-colors ${
                    isSelected ? "bg-[#111A23] text-[#48E6D2]" : "text-[#E6EDF3] hover:bg-[#111A23]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#48E6D2]" : "text-[#8A98A6]"}`} />
                    <span>{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8A98A6] uppercase tracking-wider">
                      {cmd.group}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#48E6D2]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-[#070B11] border-t border-[#1D2B35] flex items-center justify-between text-[11px] font-mono text-[#8A98A6]">
          <span>Use ↑↓ to navigate, ↵ to select</span>
          <span className="text-[#48E6D2]">SENTINEL AI CLI</span>
        </div>
      </div>
    </div>
  );
}
