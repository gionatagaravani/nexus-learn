"use client";

import { 
  Edit3, Clock, Plus, Trash2, Save, Loader2, Wand2, Search, 
  Eye, Bold, Italic, Heading1, Heading2, List, Type,
  Maximize2, Minimize2, X
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export function NotesTab({ subjectId, userId, isScrolled }: { subjectId: string; userId?: string; isScrolled?: boolean }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreview, setIsPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { t, locale } = useTranslation();

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/notes?subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
        if (data.length > 0 && !activeNote) {
          setActiveNote(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [subjectId, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleCreateNote = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          userId,
          title: t('notes.newNote'),
          content: "",
        }),
      });
      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  // Debounced update for content/title
  useEffect(() => {
    if (!activeNote) return;

    const timeoutId = setTimeout(async () => {
      // Find the original note to compare
      const originalNote = notes.find(n => n.id === activeNote.id);
      if (originalNote && (originalNote.title !== activeNote.title || originalNote.content !== activeNote.content)) {
        setIsSaving(true);
        try {
          const response = await fetch(`/api/notes/${activeNote.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: activeNote.title,
              content: activeNote.content
            }),
          });
          if (response.ok) {
            const updatedNote = await response.json();
            setNotes(prev => prev.map(n => n.id === activeNote.id ? updatedNote : n));
          }
        } catch (error) {
          console.error("Error auto-saving note:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [activeNote?.title, activeNote?.content, activeNote?.id]);

  const handleUpdateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    setActiveNote({ ...activeNote, ...updates });
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm(t('notes.deleteConfirm'))) return;
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (activeNote?.id === id) {
          setActiveNote(newNotes[0] || null);
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleGenerateAINotes = async () => {
    if (!userId) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          userId,
          prompt: activeNote && activeNote.title !== t('notes.newNote') 
            ? `Generate detailed notes about: ${activeNote.title}` 
            : "A comprehensive summary of the course materials.",
          lingua: locale
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('notes.generateFailed'));
      
      if (activeNote) {
        handleUpdateActiveNote({ content: data.notes });
      } else {
        // If no active note, create one with the generated content
        const createRes = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId,
            userId,
            title: t('notes.aiGenerated'),
            content: data.notes,
          }),
        });
        if (createRes.ok) {
          const newNote = await createRes.json();
          setNotes(prev => [newNote, ...prev]);
          setActiveNote(newNote);
        }
      }
    } catch (error) {
      console.error("Error generating AI notes:", error);
      alert(error instanceof Error ? error.message : t('notes.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const insertText = (before: string, after: string = "") => {
    if (!textAreaRef.current || !activeNote) return;

    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = activeNote.content;
    const selectedText = text.substring(start, end);
    
    const newContent = 
      text.substring(0, start) + 
      before + selectedText + after + 
      text.substring(end);

    handleUpdateActiveNote({ content: newContent });

    // Reset focus and selection
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(
          start + before.length,
          end + before.length
        );
      }
    }, 0);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600));
    
    if (diffHours < 1) return t('common.justNow');
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex overflow-hidden transition-all
      ${isFullscreen 
        ? 'fixed inset-4 z-[100] h-[calc(100vh-32px)] bg-white border border-black/[0.08] rounded-[12px] shadow-2xl' 
        : 'flex-1 h-full bg-transparent'
      }`}
    >
      {/* Sidebar for Notes List - Hidden in fullscreen if you prefer, but usually good to keep for navigation or toggle it */}
      <div className={`${isFullscreen ? 'w-[240px]' : 'w-1/3 min-w-[280px]'} border border-black/[0.08] md:rounded-l-[12px] bg-[#FAFAFA] flex flex-col hidden md:flex`}>
         <div className="p-4 border-b border-black/[0.08] flex justify-between items-center bg-[#FAFAFA]/80 backdrop-blur-sm">
            <h3 className="font-semibold text-black text-[11px] uppercase tracking-[0.1em]">{t('notes.title')}</h3>
            <button 
              onClick={handleCreateNote}
              className="h-7 w-7 flex items-center justify-center rounded-md bg-white border border-black/[0.08] text-neutral-500 hover:text-black shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
         </div>

         <div className="p-3 border-b border-black/[0.04]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input 
                type="text" 
                placeholder={t('notes.searchPlaceholder')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-black/[0.06] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-black/5 placeholder:text-neutral-400"
              />
            </div>
         </div>

         <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-neutral-300 animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-[12px] text-neutral-400 font-medium">{t('notes.noNotesFound')}</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button 
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`px-3 py-3 rounded-[8px] border flex flex-col text-left text-sm gap-1.5 transition-all relative group
                    ${activeNote?.id === note.id 
                      ? 'bg-white border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-black before:rounded-r-full' 
                      : 'border-transparent hover:bg-black/[0.02] text-neutral-500'
                    }`}
                >
                   <span className={`font-semibold text-[13px] ${activeNote?.id === note.id ? 'text-black' : ''} truncate w-full`}>
                     {note.title || t('notes.untitled')}
                   </span>
                   <span className="text-neutral-500 text-[12px] line-clamp-2 w-full leading-relaxed">
                     {note.content || t('notes.emptyNote')}
                   </span>
                   <div className="flex items-center justify-between mt-1">
                      <span className="text-neutral-400 text-[11px] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3 h-3 text-neutral-300"/> {formatDate(note.updated_at)}
                      </span>
                      {activeNote?.id === note.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                   </div>
                </button>
              ))
            )}
         </div>
      </div>
      
      {/* Main Note Editor */}
      <div className={`flex-1 flex flex-col bg-white border-y border-r border-black/[0.08] md:rounded-r-[12px] ${isFullscreen ? 'border-none rounded-none' : ''}`}>
         <AnimatePresence mode="wait">
           {activeNote ? (
             <motion.div 
               key={activeNote.id}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -5 }}
               className="flex flex-col h-full"
             >
               <div className="h-14 border-b border-black/[0.08] flex items-center justify-between px-6 bg-white shrink-0">
                 <input 
                   type="text" 
                   className="text-[15px] font-bold tracking-tight text-black bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-300 w-full" 
                   value={activeNote.title}
                   onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                   placeholder={t('notes.titlePlaceholder')}
                 />
                 <div className="flex items-center gap-2">
                   {isSaving && <Loader2 className="w-3.5 h-3.5 text-neutral-300 animate-spin mr-1" />}
                   
                   <button 
                     onClick={handleGenerateAINotes}
                     disabled={isGenerating}
                     className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-black/[0.08] text-neutral-500 hover:text-black shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] transition-all disabled:opacity-50"
                     title={t('notes.aiEnhance')}
                   >
                     {isGenerating ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <Wand2 className="w-4 h-4" />
                     )}
                   </button>

                   <button 
                     onClick={() => setIsFullscreen(!isFullscreen)}
                     className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-black/[0.08] text-neutral-500 hover:text-black shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] transition-all"
                     title={isFullscreen ? t('notes.exitFullscreen') : t('notes.fullscreen')}
                   >
                     {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                   </button>
                 </div>
               </div>

               {/* Toolbar */}
               <div className="px-6 py-2 border-b border-black/[0.04] bg-[#FAFAFA]/50 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1">
                    <button onClick={() => insertText("**", "**")} className="p-1.5 hover:bg-black/5 rounded-md text-neutral-600 transition-all" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => insertText("_", "_")} className="p-1.5 hover:bg-black/5 rounded-md text-neutral-600 transition-all" title="Italic"><Italic className="w-4 h-4" /></button>
                    <div className="w-[1px] h-4 bg-black/10 mx-1" />
                    <button onClick={() => insertText("# ")} className="p-1.5 hover:bg-black/5 rounded-md text-neutral-600 transition-all" title="H1"><Heading1 className="w-4 h-4" /></button>
                    <button onClick={() => insertText("## ")} className="p-1.5 hover:bg-black/5 rounded-md text-neutral-600 transition-all" title="H2"><Heading2 className="w-4 h-4" /></button>
                    <button onClick={() => insertText("- ")} className="p-1.5 hover:bg-black/5 rounded-md text-neutral-600 transition-all" title="List"><List className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex items-center bg-white border border-black/[0.08] rounded-lg p-0.5">
                    <button 
                      onClick={() => setIsPreview(false)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${!isPreview ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}
                    >
                      {t('common.edit')}
                    </button>
                    <button 
                      onClick={() => setIsPreview(true)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${isPreview ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}
                    >
                      {t('common.preview')}
                    </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                  {!isPreview ? (
                    <textarea
                      ref={textAreaRef}
                      className="w-full h-full p-8 text-[14px] leading-relaxed text-neutral-700 bg-white border-none focus:outline-none focus:ring-0 resize-none placeholder:text-neutral-300 font-medium min-h-full"
                      placeholder={t('notes.editorPlaceholder')}
                      value={activeNote.content}
                      onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                    />
                  ) : (
                    <div className="p-8 prose prose-sm prose-neutral max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                         {activeNote.content || t('notes.noContent')}
                       </ReactMarkdown>
                    </div>
                  )}
               </div>
             </motion.div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-4">
               <div className="p-4 bg-[#FAFAFA] rounded-full">
                 <Edit3 className="w-8 h-8 opacity-20" />
               </div>
               <div className="text-center">
                 <p className="text-sm font-semibold text-black">{t('notes.noSelection')}</p>
                 <p className="text-xs">{t('notes.selectToStart')}</p>
               </div>
               <button 
                 onClick={handleCreateNote}
                 className="mt-2 px-4 py-2 bg-black text-white text-[12px] font-bold rounded-full hover:bg-neutral-800 transition-all shadow-lg shadow-black/10"
               >
                 {t('notes.createFirstBtn')}
               </button>
             </div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
}
