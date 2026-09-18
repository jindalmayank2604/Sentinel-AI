import React from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  GitFork 
} from "lucide-react";

export function MobileNav({ activePage, onNavigate }) {
  const navItems = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { id: "WORKBENCH", label: "Circuit", icon: Cpu },
    { id: "SIGNAL LAB", label: "Signal", icon: Activity },
    { id: "AI MODELS", label: "AI RUL", icon: BrainCircuit },
    { id: "RELIABILITY", label: "Reliab.", icon: ShieldCheck },
    { id: "DIGITAL TWIN", label: "Twin", icon: GitFork }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0D141C]/95 backdrop-blur-md border-t border-[#1D2B35] px-2 flex items-center justify-around z-40">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              isActive 
                ? "text-[#48E6D2]" 
                : "text-[#8A98A6] hover:text-[#E6EDF3]"
            }`}
          >
            <div className={`p-1 rounded-none transition-transform ${isActive ? "scale-110" : ""}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
