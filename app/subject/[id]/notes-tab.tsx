import { Edit3, Clock, Plus } from "lucide-react";

export function NotesTab() {
  return (
    <div className="flex h-[calc(100vh-280px)] border border-black/[0.08] rounded-[12px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Sidebar for Notes List */}
      <div className="w-1/3 border-r border-black/[0.08] bg-[#FAFAFA] flex flex-col hidden md:flex">
         <div className="p-4 border-b border-black/[0.08] flex justify-between items-center bg-[#FAFAFA]/80">
            <h3 className="font-semibold text-black text-[13px] uppercase tracking-widest">All Notes</h3>
            <button className="h-7 w-7 flex items-center justify-center rounded-md bg-white border border-black/[0.08] text-neutral-500 hover:text-black shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] transition-all">
              <Plus className="w-4 h-4" />
            </button>
         </div>
         <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
            <button className="bg-white px-3 py-3 rounded-[8px] border border-black/[0.08] flex flex-col text-left text-sm gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-black before:rounded-r-full">
               <span className="font-semibold text-black text-[13px]">Lecture 1 Summary</span>
               <span className="text-neutral-500 text-[12px] truncate w-full">Gradient descent is an optimization algorithm used to minimize...</span>
               <span className="text-neutral-400 text-[11px] flex items-center gap-1.5 mt-1 font-medium"><Clock className="w-3 h-3 text-neutral-300"/> 2 hrs ago</span>
            </button>
            <button className="px-3 py-3 rounded-[8px] border border-transparent hover:bg-black/[0.04] flex flex-col text-left text-sm gap-1.5 transition-colors">
               <span className="font-semibold text-neutral-600 text-[13px]">Backpropagation Notes</span>
               <span className="text-neutral-500 text-[12px] truncate w-full">The chain rule is applied backward through the network...</span>
               <span className="text-neutral-400 text-[11px] flex items-center gap-1.5 mt-1 font-medium"><Clock className="w-3 h-3 text-neutral-300"/> Yesterday</span>
            </button>
         </div>
      </div>
      
      {/* Main Note Editor */}
      <div className="flex-1 flex flex-col">
         <div className="h-14 border-b border-black/[0.08] flex items-center justify-between px-6 bg-white shrink-0">
           <input type="text" className="text-[16px] font-semibold tracking-tight text-black bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-neutral-300 w-full" defaultValue="Lecture 1 Summary" />
           <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold text-black bg-[#FAFAFA] border border-black/[0.08] hover:bg-black/[0.02] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
               <Edit3 className="w-3.5 h-3.5" />
               Extract Insights
             </button>
           </div>
         </div>
         <div className="flex-1 p-8 overflow-y-auto bg-white">
            <div className="prose prose-sm prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-black text-neutral-600">
              <h3>Introduction to Gradient Descent</h3>
              <p>Gradient descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. The idea is to take repeated steps in the opposite direction of the gradient (or approximate gradient) of the function at the current point, because this is the direction of steepest descent.</p>
              <ul>
                 <li><b>Learning rate (alpha):</b> Determines the size of the steps we take to reach a minimum. If alpha is too small, learning is slow. If it&apos;s too large, it can overshoot the minimum.</li>
                 <li><b>Cost function:</b> A measure of how wrong the model is in terms of its ability to estimate the relationship between X and y.</li>
              </ul>
              <blockquote>
                &quot;Minimizing the loss function is the core of training any neural network.&quot;
              </blockquote>
            </div>
         </div>
      </div>
    </div>
  );
}
