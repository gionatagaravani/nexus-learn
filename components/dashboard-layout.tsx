"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar onMobileMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8" id="main-scroll-container">
          <div className="max-w-7xl mx-auto h-full space-y-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
