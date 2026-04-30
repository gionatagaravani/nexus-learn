import { PlayCircle, CheckCircle2, Clock, BarChart3, Plus } from "lucide-react";

export function ExercisesTab() {
  return (
    <div className="flex flex-col h-full gap-6">
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          {/* Main action card */}
          <div className="bg-black rounded-[12px] p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer group hover:bg-neutral-900 transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Plus className="w-24 h-24 text-white" />
             </div>
             <div className="relative z-10">
                <h3 className="text-[18px] font-semibold mb-1">Generate Practice</h3>
                <p className="text-neutral-400 text-sm max-w-[200px]">Create a custom quiz from your recent notes.</p>
             </div>
             <div className="relative z-10 flex items-center gap-2 mt-4 text-[13px] font-semibold text-white group-hover:gap-2.5 transition-all">
               Start Generating <PlayCircle className="w-4 h-4 text-white" />
             </div>
          </div>

          <div className="bg-white rounded-[12px] border border-black/[0.08] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center gap-2">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5}/>
               Average Score
             </div>
             <div className="text-3xl font-semibold text-black tracking-tight">84%</div>
             <div className="text-[13px] text-emerald-600 font-medium">+12% from last week</div>
          </div>
          
          <div className="bg-white rounded-[12px] border border-black/[0.08] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-center gap-2">
             <div className="flex items-center gap-2 text-neutral-500 font-semibold text-[13px]">
               <Clock className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
               Time Practiced
             </div>
             <div className="text-3xl font-semibold text-black tracking-tight">4.2h</div>
             <div className="text-[13px] text-neutral-500 font-medium">This month so far</div>
          </div>
       </div>

       <div className="flex flex-col gap-4">
         <h2 className="text-[15px] font-semibold text-black mt-4">Recent Quizzes</h2>
         <div className="bg-white border border-black/[0.08] text-[13px] rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-black/[0.08] bg-[#FAFAFA]/50 font-semibold text-neutral-500 tracking-wide">
               <div className="col-span-6 md:col-span-4">Quiz Name</div>
               <div className="col-span-3 hidden md:block">Source Material</div>
               <div className="col-span-3">Score</div>
               <div className="col-span-3 md:col-span-2 text-right">Action</div>
            </div>
            
            {[
              { id: 1, name: "SVM & Kernels Mastery", source: "SVM Notes.pdf", score: "8/10", date: "Yesterday" },
              { id: 2, name: "Neural Networks Basics", source: "Lecture 1 - Intro.pdf", score: "10/10", date: "3 days ago" },
              { id: 3, name: "Linear Algebra Check-in", source: "All Subject Materials", score: "6/10", date: "1 week ago" },
            ].map((quiz) => (
               <div key={quiz.id} className="grid grid-cols-12 gap-4 p-4 border-b border-black/[0.04] last:border-0 items-center hover:bg-[#FAFAFA] transition-colors">
                 <div className="col-span-6 md:col-span-4 flex flex-col">
                   <span className="font-semibold text-black truncate">{quiz.name}</span>
                   <span className="text-[12px] text-neutral-500 mt-0.5">{quiz.date}</span>
                 </div>
                 <div className="col-span-3 hidden md:block font-medium text-neutral-500 truncate">{quiz.source}</div>
                 <div className="col-span-3 flex shrink-0 items-center gap-3">
                   {/* Score visualizer */}
                   <div className="w-16 h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                     <div 
                       className={`h-full ${parseInt(quiz.score) >= 8 ? 'bg-emerald-500' : parseInt(quiz.score) >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} 
                       style={{ width: `${(parseInt(quiz.score) / 10) * 100}%` }}
                     />
                   </div>
                   <span className="font-semibold text-black text-[12px]">{quiz.score}</span>
                 </div>
                 <div className="col-span-3 md:col-span-2 text-right">
                    <button className="text-[13px] font-semibold text-black hover:text-neutral-500 transition-colors">Review</button>
                 </div>
               </div>
            ))}
         </div>
       </div>

    </div>
  );
}
