"use client";

import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  BrainCircuit,
  PlusCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Exercises", href: "/exercises", icon: BookOpen },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

const mockSubjects = [
  { id: "1", name: "Machine Learning", open: true, items: ['Lectures', 'Notes'] },
  { id: "2", name: "Linear Algebra", open: false, items: [] },
  { id: "3", name: "Distributed Systems", open: false, items: [] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [subjects, setSubjects] = useState(mockSubjects);

  const toggleSubject = (id: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  return (
    <div className="w-64 border-r border-black/[0.06] bg-[#FAFAFA] h-screen flex flex-col hidden md:flex sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-black/[0.06]">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity text-black">
          <BrainCircuit className="w-5 h-5 text-black" />
          <span>Nexus</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
        <nav className="flex flex-col gap-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-black/[0.04] text-black" 
                    : "text-neutral-500 hover:text-black hover:bg-black/[0.03]"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
              My Subjects
            </h4>
            <button className="text-neutral-400 hover:text-black transition-colors">
              <PlusCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex flex-col">
                <button 
                  onClick={() => toggleSubject(subject.id)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium text-neutral-500 hover:text-black hover:bg-black/[0.03] transition-colors text-left"
                >
                  <FolderOpen className={`w-4 h-4 ${subject.open ? 'text-black' : 'text-neutral-400'}`} strokeWidth={subject.open ? 2.5 : 2} />
                  <span className="flex-1 truncate">{subject.name}</span>
                </button>
                {subject.open && (
                  <div className="ml-5 mt-1 mb-1 pl-3 border-l border-black/[0.06] flex flex-col gap-1">
                    <Link href={`/subject/${subject.id}`} className="flex items-center gap-2.5 px-2 py-1 rounded-md text-xs font-medium text-neutral-500 hover:text-black hover:bg-black/[0.03] transition-colors">
                       <FileText className="w-3.5 h-3.5" />
                       Materials & Notes
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-black leading-tight">Jane Doe</span>
            <span className="text-[11px] text-neutral-500 font-medium">Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
