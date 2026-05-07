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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MaterialsTab } from "./materials-tab";
import { ChatTab } from "./chat-tab";
import { ExercisesTab } from "./exercises-tab";
import { NotesTab } from "./notes-tab";
import { EditSubjectModal } from "@/components/edit-subject-modal";
import { useTranslation } from "@/lib/i18n/i18n-context";

type TabType = "materials" | "notes" | "chat" | "exercises";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>("materials");
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const { user, supabase } = useAuth();
  const { t } = useTranslation();

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

  const isFullHeightTab = activeTab === "chat" || activeTab === "notes";

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    if (isFullHeightTab) {
      container.style.overflow = 'hidden';
    } else {
      container.style.overflow = 'auto';
    }

    return () => {
      container.style.overflow = 'auto';
    };
  }, [isFullHeightTab]);

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
          <h2 className="text-xl font-semibold text-black mb-2">{t('subject.notFoundTitle')}</h2>
          <p className="text-neutral-500">{t('subject.notFoundDesc')}</p>
        </div>
      </DashboardLayout>
    );
  }

  const subjectId = subject.id;

  const handleSubjectUpdated = (updatedSubject: any) => {
    setSubject(updatedSubject);
  };

  return (
    <DashboardLayout>
      <div className={`flex-1 flex flex-col relative ${isFullHeightTab ? 'h-[calc(100vh-56px)] pb-0' : 'min-h-full pb-8'}`}>
        {/* Sticky Header & Tabs Container */}
        <div className={`sticky top-0 z-30 bg-[#FAFAFA] transition-all duration-300 flex flex-col -mx-4 px-4 md:-mx-8 md:px-8 border-b border-black/[0.04] ${isHeaderCollapsed ? 'pt-2 pb-3 shadow-sm gap-3' : 'pt-6 pb-6 gap-6'}`}>
          <header className={`
            flex items-start justify-between bg-white rounded-[12px] border border-black/[0.08] 
            transition-all duration-300 ease-in-out overflow-hidden shrink-0
            ${isHeaderCollapsed ? 'p-3 items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
          `}>
            <div className={`flex flex-col transition-all duration-300 ${isHeaderCollapsed ? 'gap-0' : 'gap-1'}`}>
               
               <div className={`flex items-center gap-2 text-neutral-500 font-semibold uppercase tracking-widest transition-all duration-300 overflow-hidden ${isHeaderCollapsed ? 'h-0 opacity-0 mb-0 text-[0px]' : 'h-5 opacity-100 mb-2 text-[13px]'}`}>
                 <Library className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5}/>
                 {t('subject.label')}
               </div>
               
               <h1 className={`font-semibold tracking-tight text-black transition-all duration-300 flex items-center gap-3 ${isHeaderCollapsed ? 'text-lg' : 'text-2xl'}`}>
                 {subject.icon && <span className="text-[1.1em] leading-none">{subject.icon}</span>}
                 {subject.name}
               </h1>
               
               {!isHeaderCollapsed && (
                 <div className="text-neutral-500 font-medium transition-all duration-300 overflow-hidden h-5 opacity-100 text-[14px] mt-1">
                   {t('subject.createdOn', { date: new Date(subject.created_at).toLocaleDateString() })}
                 </div>
               )}
               
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="h-8 w-8 flex items-center justify-center shrink-0 rounded-md border border-transparent text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors"
                title={isHeaderCollapsed ? "Expand Header" : "Collapse Header"}
              >
                {isHeaderCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setEditingSubject(subject)}
                className="h-8 w-8 flex items-center justify-center shrink-0 rounded-md border border-transparent text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors"
                title={t('common.edit')}
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Tabs System */}
          <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-lg w-fit border border-black/[0.04] shrink-0">
            <TabButton active={activeTab === "materials"} onClick={() => setActiveTab("materials")} icon={<FileText className="w-4 h-4"/>} label={t('subject.tabs.materials')} />
            <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} icon={<FileText className="w-4 h-4"/>} label={t('subject.tabs.notes')} />
            <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={<MessageSquare className="w-4 h-4"/>} label={t('subject.tabs.aiChat')} />
            <TabButton active={activeTab === "exercises"} onClick={() => setActiveTab("exercises")} icon={<BookOpen className="w-4 h-4"/>} label={t('subject.tabs.exercises')} />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className={`flex-1 flex flex-col min-h-0 ${isFullHeightTab ? 'overflow-hidden' : ''}`}>
          {activeTab === "materials" && <MaterialsTab subjectId={subjectId} userId={user?.id} />}
          {activeTab === "notes" && <NotesTab subjectId={subjectId} userId={user?.id} isScrolled={isHeaderCollapsed} />}
          {activeTab === "chat" && <ChatTab subjectId={subjectId} userId={user?.id} />}
          {activeTab === "exercises" && <ExercisesTab subjectId={subjectId} userId={user?.id} isScrolled={isHeaderCollapsed} />}
        </div>
      </div>

      {user && editingSubject && (
        <EditSubjectModal
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSubjectUpdated={handleSubjectUpdated}
          subject={editingSubject}
        />
      )}
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
