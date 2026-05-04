"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState } from "react";
import { 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Library, 
  Settings2,
  UploadCloud,
  MoreVertical,
  PlayCircle
} from "lucide-react";
import { MaterialsTab } from "./materials-tab";
import { ChatTab } from "./chat-tab";
import { ExercisesTab } from "./exercises-tab";
import { NotesTab } from "./notes-tab";

const mockSubject = {
  id: "1",
  title: "Machine Learning",
  description: "CS 4414 - Fall Semester",
}

type TabType = "materials" | "notes" | "chat" | "exercises";

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<TabType>("materials");

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
             <h1 className="text-2xl font-semibold tracking-tight text-black">{mockSubject.title}</h1>
             <p className="text-[14px] text-neutral-500 font-medium">{mockSubject.description}</p>
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
          {activeTab === "materials" && <MaterialsTab subjectId={mockSubject.id} />}
          {activeTab === "notes" && <NotesTab subjectId={mockSubject.id} />}
          {activeTab === "chat" && <ChatTab subjectId={mockSubject.id} />}
          {activeTab === "exercises" && <ExercisesTab subjectId={mockSubject.id} />}
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
