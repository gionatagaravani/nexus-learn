"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Library, Settings2, ChevronUp, ChevronDown } from "lucide-react";
import { EditSubjectModal } from "@/components/edit-subject-modal";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { usePathname } from "next/navigation";
import React from "react";

export default function SubjectLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const { user, supabase } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();

  useEffect(() => {
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
    if (user) {
      fetchSubject();
    }
  }, [user, supabase, params]);

  const isFullHeightTab = pathname.endsWith('/notes') || pathname.match(/\/subject\/[^\/]+$/);

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
          <h2 className="text-xl font-semibold text-black mb-2">{t('subject.notFoundTitle') || 'Subject not found'}</h2>
          <p className="text-neutral-500">{t('subject.notFoundDesc') || 'This subject may have been deleted or you do not have access to it.'}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`flex-1 flex flex-col relative ${isFullHeightTab ? 'h-[calc(100vh-56px)] pb-0' : 'min-h-full pb-8'}`}>
        <div className={`sticky top-0 z-30 bg-[#FAFAFA] transition-all duration-300 flex flex-col -mx-4 px-4 md:-mx-8 md:px-8 border-b border-black/[0.04] ${isHeaderCollapsed ? 'pt-2 pb-3 shadow-sm gap-3' : 'pt-6 pb-6 gap-6'}`}>
          <header className={`
            flex items-start justify-between bg-white rounded-[12px] border border-black/[0.08] 
            transition-all duration-300 ease-in-out overflow-hidden shrink-0
            ${isHeaderCollapsed ? 'p-3 items-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
          `}>
             <div className={`flex flex-col transition-all duration-300 ${isHeaderCollapsed ? 'gap-0' : 'gap-1'}`}>
               <div className={`flex items-center gap-2 text-neutral-500 font-semibold uppercase tracking-widest transition-all duration-300 overflow-hidden ${isHeaderCollapsed ? 'h-0 opacity-0 mb-0 text-[0px]' : 'h-5 opacity-100 mb-2 text-[13px]'}`}>
                 <Library className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5}/>
                 {t('subject.label') || 'SUBJECT'}
               </div>
               <h1 className={`font-semibold tracking-tight text-black transition-all duration-300 flex items-center gap-3 ${isHeaderCollapsed ? 'text-lg' : 'text-2xl'}`}>
                 {subject.icon && <span className="text-[1.1em] leading-none">{subject.icon}</span>}
                 {subject.name}
               </h1>
               {!isHeaderCollapsed && (
                 <div className="text-neutral-500 font-medium transition-all duration-300 overflow-hidden h-5 opacity-100 text-[14px] mt-1">
                   {t('subject.createdOn', { date: new Date(subject.created_at).toLocaleDateString() }) || `Created on ${new Date(subject.created_at).toLocaleDateString()}`}
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
                title={t('common.edit') || 'Edit'}
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </header>
        </div>

        {/* Dynamic Content Area */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
             return React.cloneElement(child, { subjectId: subject.id, isHeaderCollapsed } as any);
          }
          return child;
        })}
      </div>

      {user && editingSubject && (
        <EditSubjectModal
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSubjectUpdated={(updatedSubject) => setSubject(updatedSubject)}
          subject={editingSubject}
        />
      )}
    </DashboardLayout>
  );
}
