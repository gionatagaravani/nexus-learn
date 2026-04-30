import { UploadCloud, FileText, MoreVertical, Search, FileImage, FileBarChart } from "lucide-react";

export function MaterialsTab() {
  return (
    <div className="flex flex-col h-full gap-6">
       <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
             <input 
               type="text" 
               placeholder="Search materials..." 
               className="w-full h-8 pl-9 pr-4 rounded-md bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-black/[0.03] text-sm transition-all placeholder:text-neutral-400"
             />
          </div>
          <button className="h-8 flex items-center gap-2 px-3 rounded-md bg-black text-white text-xs font-semibold transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/[0.04]">
             <UploadCloud className="w-3.5 h-3.5" strokeWidth={2.5} />
             Upload material
          </button>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {[
           { id: 1, name: "Lecture 1 - Introduction.pdf", type: 'pdf', size: "2.4 MB" },
           { id: 2, name: "Neural_Networks_Cheat_Sheet.png", type: 'image', size: "1.1 MB" },
           { id: 3, name: "SVM Notes.pdf", type: 'pdf', size: "4.8 MB" },
           { id: 4, name: "Dataset Analysis Slides.pptx", type: 'slide', size: "15.2 MB" },
         ].map((file) => (
           <div key={file.id} className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex gap-4 items-start shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group cursor-pointer">
              <div className="p-3 rounded-lg bg-black/[0.04] text-black">
                {file.type === 'pdf' && <FileText className="w-5 h-5" strokeWidth={2} />}
                {file.type === 'image' && <FileImage className="w-5 h-5" strokeWidth={2} />}
                {file.type === 'slide' && <FileBarChart className="w-5 h-5" strokeWidth={2} />}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-[14px] font-semibold text-black truncate" title={file.name}>{file.name}</h4>
                 <p className="text-[12px] text-neutral-500 mt-0.5 font-medium">{file.size}</p>
                 <div className="flex items-center gap-3 mt-3 text-[12px] font-semibold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="hover:underline">Summarize</span>
                    <span className="hover:underline">Chat</span>
                 </div>
              </div>
              <button className="text-neutral-400 hover:text-black transition-colors rounded-md hover:bg-black/[0.04] p-1">
                <MoreVertical className="w-4 h-4" strokeWidth={2} />
              </button>
           </div>
         ))}

         {/* Upload Dropzone */}
         <div className="border border-dashed border-black/[0.15] bg-[#FAFAFA] rounded-[12px] p-4 flex flex-col items-center justify-center text-center hover:bg-neutral-100/50 hover:border-black/[0.3] transition-colors cursor-pointer min-h-[140px]">
           <UploadCloud className="w-5 h-5 text-neutral-400 mb-2" strokeWidth={2} />
           <p className="text-[13px] font-semibold text-black">Drag & drop material</p>
           <p className="text-[12px] text-neutral-500 mt-1 font-medium">PDF, PPTX, Images</p>
         </div>
       </div>
    </div>
  );
}
