import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto h-full space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
