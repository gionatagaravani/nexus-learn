"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  FileText,
  MessageSquare,
  BookOpen,
  Library,
  Settings2,
} from "lucide-react";
import { MaterialsTab } from "./materials-tab";
import { ChatTab } from "./chat-tab";
import { ExercisesTab } from "./exercises-tab";
import { NotesTab } from "./notes-tab";

type TabType = "materials" | "notes" | "chat" | "exercises";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>("materials");
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, supabase } = useAuth();

  const fetchSubject = async () => {
    const { id } = await params;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setSubject(data);
    } catch (error) {
      console.error('Error fetching subject:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubject();
    }
  }, [user, supabase]);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const currentScroll = container.scrollTop;
      setIsScrolled(prev => {
        if (!prev && currentScroll > 40) return true;
        if (prev && currentScroll < 10) return false;
        return prev;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subject) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Library className="w-16 h-16 text-neutral-300 mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">Subject not found</h2>
          <p className="text-neutral-500">The subject you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </DashboardLayout>
    );
  }

  const subjectId = subject.id;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full relative">
        {/* Sticky Header & Tabs Container */}
        <div className={`sticky top-0 z-20 bg-[#FAFAFA] transition-all duration-300 flex flex-col ${isScrolled ? 'pt-2 pb-3 -mx-4 px-4 md:-mx-8 md:px-8 shadow-sm border-b border-black/[0.04] gap-3' : 'pt-0 pb-6 gap-6'}`}>
          <header className={`
            flex items-start justify-between bg-white rounded-[12px] border border-black/[0.08] 
            transition-all duration-300 ease-in-out overflow-hidden shrink-0
            ${isScrolled ? 'p-3 items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
          `}>
            <div className={`flex flex-col transition-all duration-300 ${isScrolled ? 'gap-0' : 'gap-1'}`}>
               
               <div className={`flex items-center gap-2 text-neutral-500 font-semibold uppercase tracking-widest transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0 mb-0 text-[0px]' : 'h-5 opacity-100 mb-2 text-[13px]'}`}>
                 <Library className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5}/>
                 Subject
               </div>
               
               <h1 className={`font-semibold tracking-tight text-black transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
                 {subject.name}
               </h1>
               
               <div className={`text-neutral-500 font-medium transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0 text-[0px]' : 'h-5 opacity-100 text-[14px] mt-1'}`}>
                 Created {new Date(subject.created_at).toLocaleDateString()}
               </div>
               
            </div>
            <button className="h-8 w-8 flex items-center justify-center shrink-0 rounded-md border border-transparent text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </header>

          {/* Tabs System */}
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-lg w-fit border border-black/[0.04] shrink-0">
            <TabButton active={activeTab === "materials"} onClick={() => setActiveTab("materials")} icon={<FileText className="w-4 h-4"/>} label="Materials" />
            <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} icon={<FileText className="w-4 h-4"/>} label="Notes" />
            <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={<MessageSquare className="w-4 h-4"/>} label="AI Chat" />
            <TabButton active={activeTab === "exercises"} onClick={() => setActiveTab("exercises")} icon={<BookOpen className="w-4 h-4"/>} label="Exercises" />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden min-h-[calc(100vh-120px)] pb-12">
          {activeTab === "materials" && <MaterialsTab subjectId={subjectId} userId={user?.id} />}
          {activeTab === "notes" && <NotesTab subjectId={subjectId} userId={user?.id} />}
          {activeTab === "chat" && <ChatTab subjectId={subjectId} userId={user?.id} />}
          {activeTab === "exercises" && <ExercisesTab subjectId={subjectId} userId={user?.id} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all
        ${active 
          ? "bg-white text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-black/[0.04]" 
          : "text-neutral-500 hover:text-black border border-transparent"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
