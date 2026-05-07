"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  FileText,
  BookOpen,
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChatTab } from "./chat-tab";
import { useTranslation } from "@/lib/i18n/i18n-context";

export default function SubjectDashboardPage() {
  const params = useParams();
  const subjectId = params.id as string;
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSidebarUpload = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectId", subjectId);
      formData.append("userId", user.id);

      const response = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      router.push(`/subject/${subjectId}/materials`);
    } catch (error) {
      console.error("Upload error:", error);
      alert(t('materials.uploadFailed') || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSidebarUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleSidebarUpload(file);
  };

  return (
    <div className="flex-1 flex gap-6 min-h-0 pt-6">
      {/* Left Column: Chat */}
      <div className="w-1/2 flex flex-col bg-white rounded-2xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden relative">
        <ChatTab subjectId={subjectId} userId={user?.id} />
      </div>
      
      {/* Right Column: Sidebar */}
      <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
        
        {/* Upload Material Card */}
        <div className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <FileText className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-semibold text-[14px] flex items-center gap-2 text-black">
              <FileText className="w-4 h-4"/>
              {t('subject.tabs.materials') || 'Materials'}
            </h3>
            <Link 
              href={`/subject/${subjectId}/materials`}
              className="text-xs text-neutral-500 hover:text-black font-semibold flex items-center gap-1 transition-colors"
            >
              {t('common.viewAll') || 'View all'}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
          />
          
          <div 
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('.upload-btn')) return;
              router.push(`/subject/${subjectId}/materials`);
            }}
            className="border border-dashed border-black/[0.15] bg-[#FAFAFA] rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-100 hover:border-black/[0.3] transition-colors relative z-10 min-h-[120px]"
          >
            {isUploading ? (
              <>
                <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin mb-2" />
                <p className="text-[12px] font-semibold text-black">Uploading...</p>
              </>
            ) : (
              <>
                <button 
                  className="upload-btn w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mb-3 hover:scale-105 active:scale-95 transition-all shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="Upload new file"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} />
                </button>
                <p className="text-[13px] font-semibold text-black mb-1">Upload & View Materials</p>
                <p className="text-[11px] text-neutral-500 font-medium">Drag & drop or click to view</p>
              </>
            )}
          </div>
        </div>

        {/* Notes Card */}
        <Link 
          href={`/subject/${subjectId}/notes`}
          className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex flex-col gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer hover:border-black/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <FileText className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-semibold text-[14px] flex items-center gap-2 text-black">
              <FileText className="w-4 h-4"/>
              {t('subject.tabs.notes') || 'Notes'}
            </h3>
            <div className="w-6 h-6 rounded-full bg-black/[0.04] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <p className="text-[12px] text-neutral-500 font-medium relative z-10 mt-1">
            Manage and review your AI-generated notes.
          </p>
        </Link>

        {/* Exercises Card */}
        <Link 
          href={`/subject/${subjectId}/exercises`}
          className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex flex-col gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer hover:border-black/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 p-4 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <BookOpen className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="font-semibold text-[14px] flex items-center gap-2 text-black">
              <BookOpen className="w-4 h-4"/>
              {t('subject.tabs.exercises') || 'Exercises'}
            </h3>
            <div className="w-6 h-6 rounded-full bg-black/[0.04] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <p className="text-[12px] text-neutral-500 font-medium relative z-10 mt-1">
            Practice with interactive quizzes.
          </p>
        </Link>

      </div>
    </div>
  );
}
