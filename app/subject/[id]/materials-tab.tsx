"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, MoreVertical, Search, FileImage, FileBarChart, X, Sparkles, Loader2, Save, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface Material {
  id: string
  subject_id: string
  storage_path: string
  filename: string
  file_type: string
  file_size: number
  created_at: string
}

export function MaterialsTab({ subjectId, userId }: { subjectId: string; userId?: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ summary: string, filename: string } | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useTranslation();

  const loadMaterials = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/materials/list?subjectId=${subjectId}&userId=${userId}`
      );
      const { materials: data } = await response.json();
      setMaterials(data || []);
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const filteredMaterials = materials.filter((m) =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadMaterials();
  }, [subjectId, userId]);

  const handleUpload = async (file: File) => {
    if (!userId) {
      alert(t('materials.signInToUpload'));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectId", subjectId);
      formData.append("userId", userId);

      const response = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await loadMaterials();
    } catch (error) {
      console.error("Upload error:", error);
      alert(t('materials.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSummarize = async (materialId: string) => {
    setIsSummarizing(materialId);
    setActiveMenu(null);
    try {
      const response = await fetch("/api/materials/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, lingua: locale }),
      });

      if (!response.ok) throw new Error("Summarization failed");

      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error("Summarization error:", error);
      alert(t('materials.summaryFailed'));
    } finally {
      setIsSummarizing(null);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm(t('materials.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/materials/delete?materialId=${materialId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete material");

      setMaterials(prev => prev.filter(m => m.id !== materialId));
      setActiveMenu(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert(t('materials.deleteFailed'));
    }
  };

  const handleSaveAsNote = async () => {
    if (!summaryData || !userId) return;

    setIsSavingNote(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          userId,
          title: `Summary: ${summaryData.filename}`,
          content: summaryData.summary,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      alert(t('materials.summarySaved'));
      setSummaryData(null);
    } catch (error) {
      console.error("Save note error:", error);
      alert(t('materials.saveNoteFailed'));
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" strokeWidth={2} />;
      case 'image':
        return <FileImage className="w-5 h-5" strokeWidth={2} />;
      case 'slide':
        return <FileBarChart className="w-5 h-5" strokeWidth={2} />;
      default:
        return <FileText className="w-5 h-5" strokeWidth={2} />;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          <input
            type="text"
            placeholder={t('materials.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-4 rounded-md bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-black/[0.03] text-sm transition-all placeholder:text-neutral-400"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 flex items-center gap-2 px-3 rounded-md bg-black text-white text-xs font-semibold transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-3.5 h-3.5" strokeWidth={2.5} />
          {t('materials.uploadBtn')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex gap-4 items-start shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group cursor-pointer relative"
          >
            <div className="p-3 rounded-lg bg-black/[0.04] text-black">
              {getFileIcon(material.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-semibold text-black truncate" title={material.filename}>
                {material.filename}
              </h4>
              <p className="text-[12px] text-neutral-500 mt-0.5 font-medium">
                {formatFileSize(material.file_size)}
              </p>
              <div className="flex items-center gap-3 mt-3 text-[12px] font-semibold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSummarize(material.id);
                  }}
                  disabled={isSummarizing === material.id}
                  className="hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  {isSummarizing === material.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  {t('materials.summarizeBtn')}
                </button>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === material.id ? null : material.id);
                }}
                className="text-neutral-400 hover:text-black transition-colors rounded-md hover:bg-black/[0.04] p-1"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2} />
              </button>
              
              <AnimatePresence>
                {activeMenu === material.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl border border-black/[0.08] z-20 py-1"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(material.id);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('common.delete')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {/* Upload Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border border-dashed border-black/[0.15] bg-[#FAFAFA] rounded-[12px] p-4 flex flex-col items-center justify-center text-center hover:bg-neutral-100/50 hover:border-black/[0.3] transition-colors cursor-pointer min-h-[140px]"
        >
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mb-2" />
              <p className="text-[13px] font-semibold text-black">{t('materials.uploading')}</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-neutral-400 mb-2" strokeWidth={2} />
              <p className="text-[13px] font-semibold text-black">{t('materials.dragDrop')}</p>
              <p className="text-[12px] text-neutral-500 mt-1 font-medium">{t('materials.supportedFormats')}</p>
            </>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {summaryData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-white sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">{t('materials.aiSummary')}</h3>
                    <p className="text-xs text-neutral-500 font-medium truncate max-w-[300px]">
                      {summaryData.filename}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSummaryData(null)}
                  className="p-2 hover:bg-black/[0.05] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-white flex-1">
                <div className="prose prose-neutral max-w-none prose-h1:text-xl prose-h2:text-lg prose-p:text-sm prose-li:text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summaryData.summary}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="p-6 border-t border-black/[0.05] bg-white flex items-center justify-end gap-3">
                <button
                  onClick={() => setSummaryData(null)}
                  className="px-4 h-10 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  {t('common.close')}
                </button>
                <button
                  onClick={handleSaveAsNote}
                  disabled={isSavingNote}
                  className="px-5 h-10 rounded-xl bg-black text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isSavingNote ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('materials.saveAsNote')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

