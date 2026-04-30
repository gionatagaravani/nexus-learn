import { Send, Upload, Sparkles, User, BrainCircuit } from "lucide-react";

export function ChatTab() {
  return (
    <div className="flex flex-col h-[calc(100vh-280px)] border border-black/[0.08] rounded-[12px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">Today</span>
        </div>

        {/* User Message */}
        <div className="flex gap-4 max-w-3xl mx-auto w-full">
           <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-500">
             <User className="w-5 h-5" />
           </div>
           <div className="flex flex-col gap-1 w-full mt-1">
             <span className="text-sm font-semibold text-neutral-900">Jane Doe</span>
             <p className="text-sm text-neutral-700 leading-relaxed">
               Can you explain how Support Vector Machines work in simple terms? I&apos;m struggling to understand the &quot;kernel trick&quot;.
             </p>
           </div>
        </div>

        {/* AI Message */}
        <div className="flex gap-4 max-w-3xl mx-auto w-full bg-[#FAFAFA] border border-black/[0.04] p-5 rounded-[12px] relative group">
           <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 flex items-center justify-center text-white shadow-sm">
             <BrainCircuit className="w-4 h-4" />
           </div>
           <div className="flex flex-col gap-3 w-full mt-1">
             <div className="flex items-center gap-2">
               <span className="text-sm font-semibold text-black">Nexus</span>
               <span className="text-[12px] text-neutral-500 flex items-center gap-1 font-medium"><Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={2}/> Context loaded from &apos;SVM Notes.pdf&apos;</span>
             </div>
             <div className="prose prose-sm prose-neutral max-w-none text-neutral-700">
                <p>Imagine you have two types of balls (red and blue) scattered on a table. Your goal is to separate them with a straight stick.</p>
                <p>A <strong>Support Vector Machine (SVM)</strong> tries to find the best place to put that stick so there&apos;s the widest possible gap between the stick and the closest balls of each color. Those closest balls are called &quot;support vectors.&quot;</p>
                <p><strong>The Kernel Trick:</strong></p>
                <p>But what if the balls are mixed in a circle, and no straight stick can separate them? This is where the kernel trick comes in.</p>
                <p>You hit the table to make the balls pop up into the air (adding a dimension). While they are in the air, you can slide a flat sheet of paper (a plane) between the red and blue balls. The &quot;hit on the table&quot; math is the Kernel Trick—it maps data into a higher-dimensional space where it&apos;s easier to separate with a straight line or flat plane!</p>
             </div>
           </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-black/[0.08]">
         <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {["Create a quiz on this", "Explain mathematical proof", "Summarize Lecture 1"].map((suggestion) => (
                <button key={suggestion} className="shrink-0 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-[12px] font-semibold text-neutral-500 hover:text-black hover:bg-[#FAFAFA] transition-colors whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="relative flex items-end gap-2 bg-[#FAFAFA] rounded-[12px] p-2 border border-black/[0.08] xl:border-black/[0.1] focus-within:border-black/[0.15] focus-within:ring-4 focus-within:ring-black/[0.02] focus-within:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <button className="p-2 rounded-lg text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors shrink-0">
                <Upload className="w-5 h-5" strokeWidth={2} />
              </button>
              <textarea 
                placeholder="Ask about your materials, or type '/' for commands..." 
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-[14px] py-2 placeholder:text-neutral-400 outline-none"
                rows={1}
              />
              <button className="p-2 rounded-[8px] bg-black text-white hover:bg-neutral-800 transition-all shadow-sm shrink-0 flex items-center justify-center">
                <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
