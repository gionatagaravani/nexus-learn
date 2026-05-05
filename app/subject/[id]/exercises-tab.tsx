"use client";

import { PlayCircle, CheckCircle2, Clock, Plus, Loader2, BookOpenText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { QuizPlayer } from "./quiz-player";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questions: any[];
  created_at: string;
  subject_id: string;
  last_score: number | null;
  completed_at: string | null;
}

export function ExercisesTab({ subjectId, userId }: { subjectId: string; userId?: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/quiz/list?subjectId=${subjectId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [subjectId, userId]);

  const handleGenerateQuiz = async () => {
    if (!userId) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          userId,
          topic: "Course Content",
          difficulty: "intermediate",
          questionCount: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      await fetchQuizzes();
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(error instanceof Error ? error.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const stats = useMemo(() => {
    const completed = quizzes.filter(q => q.last_score !== null);
    if (completed.length === 0) return { avgScore: 0, completedCount: 0 };
    
    const totalScore = completed.reduce((acc, q) => acc + (q.last_score || 0), 0);
    return {
      avgScore: Math.round(totalScore / completed.length),
      completedCount: completed.length
    };
  }, [quizzes]);

  if (activeQuiz) {
    return (
      <QuizPlayer 
        quiz={activeQuiz} 
        onClose={() => {
          setActiveQuiz(null);
          fetchQuizzes(); // Refresh list to show new scores
        }} 
        onComplete={(score) => {
          console.log(`Quiz completed with score: ${score}%`);
          // QuizPlayer handles the saving, we just need to know it's done if needed
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          {/* Main action card */}
          <button 
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="bg-black rounded-[12px] p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer group hover:bg-neutral-900 transition-colors text-left disabled:opacity-70 disabled:cursor-not-allowed"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Plus className="w-24 h-24 text-white" />
             </div>
             <div className="relative z-10">
                <h3 className="text-[18px] font-semibold mb-1">Generate Practice</h3>
                <p className="text-neutral-400 text-sm max-w-[200px]">Create a custom quiz from your materials.</p>
             </div>
             <div className="relative z-10 flex items-center gap-2 mt-4 text-[13px] font-semibold text-white group-hover:gap-2.5 transition-all">
               {isGenerating ? (
                 <>Generating... <Loader2 className="w-4 h-4 text-white animate-spin" /></>
               ) : (
                 <>Start Generating <PlayCircle className="w-4 h-4 text-white" /></>
               )}
             </div>
          </button>

          <div className="bg-white rounded-[12px] border border-black/[0.08] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center gap-2">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5}/>
               Average Score
             </div>
             <div className="text-3xl font-semibold text-black tracking-tight">
               {stats.avgScore > 0 ? `${stats.avgScore}%` : '--%'}
             </div>
             <div className="text-[13px] text-neutral-500 font-medium">
               {stats.completedCount > 0 ? `Based on ${stats.completedCount} quizzes` : 'Complete quizzes to see stats'}
             </div>
          </div>
          
          <div className="bg-white rounded-[12px] border border-black/[0.08] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center gap-2">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
               <Clock className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
               Quizzes Completed
             </div>
             <div className="text-3xl font-semibold text-black tracking-tight">{stats.completedCount}</div>
             <div className="text-[13px] text-neutral-500 font-medium">Out of {quizzes.length} available</div>
          </div>
       </div>

       <div className="flex flex-col gap-4">
         <h2 className="text-[15px] font-semibold text-black mt-4">Recent Quizzes</h2>
         
         {loading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-6 h-6 text-neutral-300 animate-spin" />
           </div>
         ) : quizzes.length === 0 ? (
           <div className="bg-white border border-dashed border-black/[0.08] rounded-[12px] p-12 text-center flex flex-col items-center gap-3">
             <BookOpenText className="w-10 h-10 text-neutral-300" />
             <div>
               <p className="text-sm font-semibold text-black">No quizzes yet</p>
               <p className="text-xs text-neutral-500">Generate a quiz to start practicing your knowledge.</p>
             </div>
           </div>
         ) : (
           <div className="bg-white border border-black/[0.08] text-[13px] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-black/[0.08] bg-[#FAFAFA]/50 font-semibold text-neutral-500 tracking-wide">
                 <div className="col-span-4 md:col-span-4">Quiz Name</div>
                 <div className="col-span-3">Difficulty</div>
                 <div className="col-span-3">Score</div>
                 <div className="col-span-2 md:col-span-2 text-right">Action</div>
              </div>
              
              {quizzes.map((quiz) => (
                 <div key={quiz.id} className="grid grid-cols-12 gap-4 p-4 border-b border-black/[0.04] last:border-0 items-center hover:bg-[#FAFAFA] transition-colors">
                   <div className="col-span-4 md:col-span-4 flex flex-col">
                     <span className="font-semibold text-black truncate">{quiz.title}</span>
                     <span className="text-[12px] text-neutral-500 mt-0.5">{formatDate(quiz.created_at)}</span>
                   </div>
                   <div className="col-span-3">
                     <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                       quiz.difficulty === 'advanced' ? 'bg-red-50 text-red-600' :
                       quiz.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                       'bg-emerald-50 text-emerald-600'
                     }`}>
                       {quiz.difficulty}
                     </span>
                   </div>
                   <div className="col-span-3 flex shrink-0 items-center gap-3">
                     {quiz.last_score !== null ? (
                       <>
                         <div className="w-16 h-1.5 rounded-full bg-black/[0.04] overflow-hidden hidden sm:block">
                           <div 
                             className={`h-full ${quiz.last_score >= 80 ? 'bg-emerald-500' : quiz.last_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                             style={{ width: `${quiz.last_score}%` }}
                           />
                         </div>
                         <span className="font-bold text-black text-[12px]">{quiz.last_score}%</span>
                       </>
                     ) : (
                       <span className="text-neutral-400 text-[12px]">Not taken</span>
                     )}
                   </div>
                   <div className="col-span-2 md:col-span-2 text-right">
                      <button 
                        onClick={() => setActiveQuiz(quiz)}
                        className="text-[13px] font-bold text-black hover:text-neutral-500 transition-colors"
                      >
                        {quiz.last_score !== null ? 'Retake' : 'Start'}
                      </button>
                   </div>
                 </div>
              ))}
           </div>
         )}
       </div>

    </div>
  );
}
