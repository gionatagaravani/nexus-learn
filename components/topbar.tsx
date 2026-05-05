"use client";

import { Bell, Search, LogIn, Menu } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export function Topbar({ onMobileMenuClick }: { onMobileMenuClick?: () => void }) {
  const { user, loading } = useAuth();

  return (
    <header className="h-14 border-b border-black/[0.06] bg-[#FAFAFA]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 transition-shadow">
      <div className="flex-1 flex justify-start items-center gap-3">
        <button 
          className="md:hidden text-neutral-500 hover:text-black transition-colors"
          onClick={onMobileMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-full max-w-sm relative flex text-neutral-400 focus-within:text-neutral-900 transition-colors hidden sm:flex">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-9 pr-4 rounded-md bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-black/[0.03] text-sm transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!loading && user ? (
          <>

            <button className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-500 hover:text-black hover:bg-black/[0.04] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border-2 border-[#FAFAFA]"></span>
            </button>
          </>
        ) : null}
        {!loading && !user ? (
          <Link
            href="/login"
            className="h-8 items-center gap-2 px-3 rounded-md bg-black text-white text-xs font-semibold transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/[0.04] hidden sm:flex"
          >
            <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
            Sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
