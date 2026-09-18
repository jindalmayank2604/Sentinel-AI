import React from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  GitFork, 
  Sliders, 
  HelpCircle,
  Radio,
  Terminal,
  ChevronRight
} from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";

export function Sidebar({ 
  activePage, 
  onNavigate, 
  collapsed, 
  setCollapsed,
  onOpenStatus,
  stats
}) {
  const navItems = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard, badge: "LIVE" },
    { id: "WORKBENCH", label: "Circuit Workbench", icon: Cpu, badge: stats?.partsCount ? `${stats.partsCount}P` : "2D/3D" },
    { id: "SIGNAL LAB", label: "Signal Lab", icon: Activity, badge: "DSP" },
    { id: "AI MODELS", label: "AI Models", icon: BrainCircuit, badge: "RUL" },
    { id: "RELIABILITY", label: "Reliability", icon: ShieldCheck, badge: "WEIBULL" },
    { id: "DIGITAL TWIN", label: "Digital Twin", icon: GitFork, badge: "LINK" }
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col bg-[#0D141C] border-r border-[#1D2B35] transition-all duration-300 select-none z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1D2B35] justify-between">
        <div 
          onClick={() => onNavigate("OVERVIEW")} 
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-8 h-8 rounded-none border border-[#48E6D2] bg-[#48E6D2]/10 text-[#48E6D2] flex items-center justify-center font-mono font-bold text-base shrink-0 shadow-[0_0_10px_rgba(72,230,210,0.2)]">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-sans font-bold tracking-wider text-sm text-[#E6EDF3] leading-none flex items-center gap-1">
                SENTINEL<span className="text-[#48E6D2]">AI</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest text-[#8A98A6] uppercase mt-1">
                ENGINEERING INTELLIGENCE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-[#8A98A6] uppercase">
            WORKSPACE MODULES
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-sans rounded-none transition-all duration-150 relative group ${
                isActive
                  ? "bg-[#111A23] text-[#48E6D2] border-l-2 border-[#48E6D2] shadow-sm"
                  : "text-[#8A98A6] hover:bg-[#111A23]/60 hover:text-[#E6EDF3] border-l-2 border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-[#48E6D2]" : "text-[#8A98A6] group-hover:text-[#E6EDF3]"}`} />
              {!collapsed && (
                <>
                  <span className="font-medium truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${
                      isActive 
                        ? "bg-[#48E6D2]/10 text-[#48E6D2] border-[#48E6D2]/30" 
                        : "bg-[#111A23] text-[#8A98A6] border-[#1D2B35]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-[#1D2B35] bg-[#070B11]/60">
        {!collapsed ? (
          <div 
            onClick={onOpenStatus}
            className="p-2.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-[#8A98A6]">CORE ENGINE</span>
              <StatusBadge status="healthy" label="READY" size="sm" pulse />
            </div>
            <div className="text-[11px] font-mono text-[#E6EDF3] flex items-center justify-between">
              <span>LOCAL v1.4</span>
              <span className="text-[#48E6D2] text-[10px]">INSPECT →</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={onOpenStatus}
            className="w-full flex justify-center py-2 text-[#22C55E] hover:text-[#48E6D2]"
            title="System Status"
          >
            <Radio className="w-4 h-4 animate-pulse" />
          </button>
        )}
      </div>
    </aside>
  );
}
