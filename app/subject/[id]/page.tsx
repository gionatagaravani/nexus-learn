"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { createBrowserClient } from "@supabase/ssr";
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
  const { user } = useAuth();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ));

  useEffect(() => {
    if (user) {
      fetchSubject();
    }
  }, [user, supabase]);

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
      <div className="flex flex-col gap-6 h-full">
        {/* Subject Header */}
        <header className="flex items-start justify-between bg-white p-6 rounded-[12px] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px] mb-2 uppercase tracking-widest">
               <Library className="w-3.5 h-3.5" strokeWidth={2.5}/>
               Subject
             </div>
             <h1 className="text-2xl font-semibold tracking-tight text-black">{subject.name}</h1>
             <p className="text-[14px] text-neutral-500 font-medium">
               Created {new Date(subject.created_at).toLocaleDateString()}
             </p>
          </div>
          <button className="h-8 w-8 flex items-center justify-center rounded-md border border-transparent text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </header>

        {/* Tabs System */}
        <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-lg w-fit border border-black/[0.04]">
          <TabButton active={activeTab === "materials"} onClick={() => setActiveTab("materials")} icon={<FileText className="w-4 h-4"/>} label="Materials" />
          <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} icon={<FileText className="w-4 h-4"/>} label="Notes" />
          <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={<MessageSquare className="w-4 h-4"/>} label="AI Chat" />
          <TabButton active={activeTab === "exercises"} onClick={() => setActiveTab("exercises")} icon={<BookOpen className="w-4 h-4"/>} label="Exercises" />
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-hidden min-h-[500px]">
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
