import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "../common/CommandPalette";
import { SystemStatusModal } from "../common/SystemStatusModal";

export function AppShell({ 
  children, 
  activePage, 
  onNavigate, 
  onAction,
  onExport,
  stats,
  notifications = []
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Global ⌘K shortcut listener
  React.useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B11] text-[#E6EDF3] flex flex-row overflow-x-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onOpenStatus={() => setIsStatusModalOpen(true)}
        stats={stats}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar
          activePage={activePage}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenStatus={() => setIsStatusModalOpen(true)}
          onExport={onExport}
          notifications={notifications}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activePage={activePage} onNavigate={onNavigate} />

      {/* Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={onNavigate}
        onAction={onAction}
      />

      {/* Global System Status Modal */}
      <SystemStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        subsystems={stats?.subsystems}
      />
    </div>
  );
}
