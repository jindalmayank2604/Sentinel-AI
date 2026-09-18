import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  FileSpreadsheet, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Clock, 
  Terminal,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";

export function TopBar({ 
  activePage, 
  onToggleSidebar, 
  sidebarCollapsed, 
  onOpenCommandPalette, 
  onOpenStatus,
  onExport,
  notifications = []
}) {
  const [time, setTime] = useState(new Date().toTimeString().split(" ")[0]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toTimeString().split(" ")[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    OVERVIEW: "SYSTEM MONITORING OVERVIEW",
    WORKBENCH: "ADVANCED CIRCUIT WORKBENCH",
    "SIGNAL LAB": "SIGNAL DSP & SPECTRAL LAB",
    "AI MODELS": "NASA C-MAPSS RUL PREDICTION",
    RELIABILITY: "WEIBULL RELIABILITY ANALYSIS",
    "DIGITAL TWIN": "DIGITAL TWIN TOPOLOGY LINK"
  };

  return (
    <header className="h-16 bg-[#0D141C] border-b border-[#1D2B35] px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 text-[#8A98A6] hover:text-[#E6EDF3] hover:bg-[#111A23] border border-transparent hover:border-[#1D2B35] transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-[#48E6D2] uppercase bg-[#48E6D2]/10 border border-[#48E6D2]/30 px-2 py-0.5 hidden sm:inline-block">
            SYS::ACTIVE
          </span>
          <span className="text-xs font-mono font-medium text-[#E6EDF3] tracking-wide truncate max-w-[160px] sm:max-w-none">
            {pageTitles[activePage] || activePage}
          </span>
        </div>
      </div>

      {/* Center / Right: Actions & Tools */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/40 text-[#8A98A6] hover:text-[#E6EDF3] text-xs font-mono transition-colors"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span className="hidden lg:inline">Quick actions...</span>
          <span className="hidden sm:inline-block text-[10px] bg-[#070B11] border border-[#1D2B35] px-1 py-0.2 text-[#8A98A6]">
            ⌘K
          </span>
        </button>

        {/* Global Status Button */}
        <div className="hidden sm:block">
          <StatusBadge 
            status="healthy" 
            label="SYSTEM OPERATIONAL" 
            size="sm" 
            pulse 
            onClick={onOpenStatus}
          />
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-[#8A98A6] px-2.5 py-1 bg-[#111A23] border border-[#1D2B35]">
          <Clock className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span>{time} UTC</span>
        </div>

        {/* Export Report Trigger */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/60 text-[#E6EDF3] text-xs font-mono transition-colors"
          title="Export Technical Report"
        >
          <Download className="w-3.5 h-3.5 text-[#48E6D2]" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-1.5 bg-[#111A23] border border-[#1D2B35] hover:border-[#48E6D2]/50 text-[#8A98A6] hover:text-[#E6EDF3] transition-colors relative"
            title="System Events & Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#48E6D2] rounded-full ring-2 ring-[#0D141C]" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D141C] border border-[#2E4252] shadow-2xl z-50 p-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#1D2B35] text-[11px] font-mono text-[#E6EDF3]">
                <span>SYSTEM EVENTS LOG</span>
                <span className="text-[#48E6D2]">{notifications.length} ACTIVE</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-[#1D2B35]/40 py-1">
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-xs font-mono text-[#8A98A6]">
                    No system anomalies logged.
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="py-2 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A98A6]">
                        <span className="text-[#48E6D2]">{n.source}</span>
                        <span>{n.time}</span>
                      </div>
                      <div className="text-[#E6EDF3] mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
